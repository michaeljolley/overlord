
export class StreamUser {
  constructor(
    public login: string,
    public avatar_url: string,
    public id: string,
    public display_name?: string,
    public lastUpdated?: Date,
  ) { }
}
