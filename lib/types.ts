export interface Song {
  rank: number;
  title: string;
  totalStreams: number;
  dailyStreams: number;
}

export interface ArtistData {
  artistName: string;
  artistId: string;
  imageUrl?: string;
  songs: Song[];
  topTen: Song[];
}
