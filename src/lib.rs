extern crate winapi;
use std::mem::size_of;
use std::ffi::CStr;
use std::os::raw::c_char;
use winapi::um::winuser::{
    EnumThreadWindows,
    GetWindowTextA
};
use winapi::um::tlhelp32::{
    CreateToolhelp32Snapshot,
    PROCESSENTRY32,
    Process32First,
    Process32Next,
    TH32CS_SNAPPROCESS,
    TH32CS_SNAPTHREAD,
    THREADENTRY32,
    Thread32First,
    Thread32Next,
};
use winapi::um::winnt::HANDLE;
use winapi::shared::minwindef::{
    DWORD,  // u32
    BOOL,   // i32
};
use winapi::um::handleapi::{ INVALID_HANDLE_VALUE, CloseHandle };
use winapi::shared::windef::HWND;       // isize
use winapi::shared::minwindef::LPARAM;  // isize

type WindowTitleVec = Vec<String>;

/// Spotify for Windows executable name
const SPOTIFY_EXECUTABLE: &str = "Spotify.exe";

#[derive(Debug, Default)]
struct WindowTitleState {
    titles: WindowTitleVec
}

pub enum SongTitleFetchError {
    SpotifyNotRunning,
    MultipleResults
}

/// Callback for windows enumerator functions
unsafe extern "system" fn window_enumerator_cb(handle: HWND, titles: LPARAM) -> BOOL {

    get_window_title(handle, titles);

    1 // Continue until iterator is exhausted
}

/// Get process ids for spotify.exe
pub fn get_spotify_pids() -> Option<Vec<DWORD>> {
    let mut snapshot_handle: HANDLE = INVALID_HANDLE_VALUE;
    let mut pids: Vec<DWORD> = Vec::new();

    // Struct does not implement Default trait
    // so we init manually.
    let mut process_entry: PROCESSENTRY32 = PROCESSENTRY32 {
        dwSize: size_of::<PROCESSENTRY32>() as DWORD,
        cntUsage: 0,
        th32ProcessID: 0,
        th32DefaultHeapID: 0,
        th32ModuleID: 0,
        cntThreads: 0,
        th32ParentProcessID: 0,
        pcPriClassBase: 0,
        dwFlags: 0,
        szExeFile: [0; 260],
    };

    unsafe {
        snapshot_handle = CreateToolhelp32Snapshot(TH32CS_SNAPPROCESS, 0);
    }

    if snapshot_handle == INVALID_HANDLE_VALUE {
        // Invalid handle
        return None;
    }

    unsafe {
        if Process32First(snapshot_handle, &mut process_entry) == 0 {
            // Failed to fetch first process
            CloseHandle(snapshot_handle);
            return None;
        }

        while Process32Next(snapshot_handle, &mut process_entry) != 0 {
            let exe_file = CStr::from_ptr(process_entry.szExeFile.as_ptr());
            let exe_file_string = exe_file.to_str().unwrap();
            if exe_file_string == SPOTIFY_EXECUTABLE {
                pids.push(process_entry.th32ProcessID);
            }
        }
    }

    unsafe { CloseHandle(snapshot_handle) };

    Some(pids)
}

/// Get thread ids for the given process id.
fn get_thread_ids(process_id: &DWORD) -> Vec<DWORD> {
    let mut thread_ids: Vec<DWORD> = Vec::new();
    let mut snapshot_handle: HANDLE = INVALID_HANDLE_VALUE;
    let mut thread_entry: THREADENTRY32 = THREADENTRY32 {
        dwSize: size_of::<THREADENTRY32>() as DWORD,
        cntUsage: 0,
        dwFlags: 0,
        th32OwnerProcessID: 0,
        th32ThreadID: 0,
        tpBasePri: 0,
        tpDeltaPri: 0,
    };


    unsafe {
        snapshot_handle = CreateToolhelp32Snapshot(TH32CS_SNAPTHREAD, 0);
    }

    if snapshot_handle == INVALID_HANDLE_VALUE {
        // Invalid handle
        return thread_ids;
    }

    let process_id_value = *process_id;
    unsafe {
        if Thread32First(snapshot_handle, &mut thread_entry) == 0 {
            CloseHandle(snapshot_handle);
            return thread_ids;
        }

        while Thread32Next(snapshot_handle, &mut thread_entry) != 0 {
            if thread_entry.th32OwnerProcessID != process_id_value {
                continue;
            }

            thread_ids.push(thread_entry.th32ThreadID);
        }
    }

    unsafe { CloseHandle(snapshot_handle) };

    thread_ids
}

/// Get window title for thread with given id.
fn get_thread_window_titles(thread_id: &DWORD) -> WindowTitleVec {
    let mut title_state: WindowTitleState = WindowTitleState::default();

    // Get a raw, mutable pointer to the struct
    let title_state_ptr = &mut title_state as *mut WindowTitleState as isize;

    unsafe {
        EnumThreadWindows(*thread_id, Some(window_enumerator_cb), title_state_ptr);
    }

    title_state.titles
}

/// Get main window title from the provided window handle.
/// Presumes that `titles` is a mutable pointer to a String vector
fn get_window_title(handle: HWND, titles: LPARAM) {
    // https://docs.microsoft.com/en-us/windows/win32/api/winuser/nf-winuser-getwindowtexta
    const CAPACITY: i32 = 128;
    let fill = 0 as c_char;
    let mut title = [fill; CAPACITY as usize];
    let length;

    unsafe {
        length = GetWindowTextA(handle, title.as_mut_ptr(), CAPACITY);

        if length <= 2 {
            return;
        }

        let result = match CStr::from_ptr(title.as_mut_ptr()).to_str() {
            Ok(title) => title.trim(),
            Err(_) => return,
        };

        if !result.contains("-") {
            // Likely not a song title
            return;
        }

        // Treat the LPARAM as raw mutable pointer
        let title_state = titles as *mut WindowTitleState;
            (*title_state).titles.push(String::from(result));
    }
}

#[cfg(windows)]
pub fn get_song_title() -> Result<String, SongTitleFetchError> {
    let title_matrix: Vec<WindowTitleVec> = get_spotify_pids().unwrap()
        .into_iter()
        .fold(Vec::new(), |acc, x| [acc, get_thread_ids(&x)].concat())
        .into_iter()
        .map(|thread_id| get_thread_window_titles(&thread_id))
        .collect();

    let window_titles: WindowTitleVec = title_matrix.concat();

    if window_titles.len() == 0 {
        return Err(SongTitleFetchError::SpotifyNotRunning);
    }

    if window_titles.len() > 1 {
        return Err(SongTitleFetchError::MultipleResults);
    }

    Ok(String::from(window_titles[0].to_owned()))
}

#[cfg(windows)]
#[cfg(test)]
mod tests {
    #[test]
    fn it_works() {
        assert_eq!(2 + 2, 4);
    }
}
