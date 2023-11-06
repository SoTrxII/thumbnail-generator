// package: thumbnail
// file: thumbnail.proto

/* tslint:disable */
/* eslint-disable */

import * as jspb from "google-protobuf";

export class ThumbnailRequest extends jspb.Message { 
    clearGmsavatarurlList(): void;
    getGmsavatarurlList(): Array<string>;
    setGmsavatarurlList(value: Array<string>): ThumbnailRequest;
    addGmsavatarurl(value: string, index?: number): string;
    getTitle(): string;
    setTitle(value: string): ThumbnailRequest;
    getEpisodetitle(): string;
    setEpisodetitle(value: string): ThumbnailRequest;
    getEpisodeindex(): number;
    setEpisodeindex(value: number): ThumbnailRequest;
    getBackgroundurl(): string;
    setBackgroundurl(value: string): ThumbnailRequest;
    getLogourl(): string;
    setLogourl(value: string): ThumbnailRequest;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): ThumbnailRequest.AsObject;
    static toObject(includeInstance: boolean, msg: ThumbnailRequest): ThumbnailRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: ThumbnailRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): ThumbnailRequest;
    static deserializeBinaryFromReader(message: ThumbnailRequest, reader: jspb.BinaryReader): ThumbnailRequest;
}

export namespace ThumbnailRequest {
    export type AsObject = {
        gmsavatarurlList: Array<string>,
        title: string,
        episodetitle: string,
        episodeindex: number,
        backgroundurl: string,
        logourl: string,
    }
}

export class ThumbnailResponse extends jspb.Message { 
    getThumbnailkey(): string;
    setThumbnailkey(value: string): ThumbnailResponse;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): ThumbnailResponse.AsObject;
    static toObject(includeInstance: boolean, msg: ThumbnailResponse): ThumbnailResponse.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: ThumbnailResponse, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): ThumbnailResponse;
    static deserializeBinaryFromReader(message: ThumbnailResponse, reader: jspb.BinaryReader): ThumbnailResponse;
}

export namespace ThumbnailResponse {
    export type AsObject = {
        thumbnailkey: string,
    }
}
