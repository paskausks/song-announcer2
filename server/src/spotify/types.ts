export interface FetchLikeResponse {
    json<T>(): Promise<T>,
    ok: boolean,
}

export type FetchLike = (url: string, options: any) => Promise<FetchLikeResponse>
