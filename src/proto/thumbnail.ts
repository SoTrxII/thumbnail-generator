/**
 * Generated by the protoc-gen-ts.  DO NOT EDIT!
 * compiler version: 3.19.1
 * source: thumbnail.proto
 * git: https://github.com/thesayyn/protoc-gen-ts */
import * as pb_1 from "google-protobuf";
import * as grpc_1 from "@grpc/grpc-js";

export namespace thumbnail {
  export class ThumbnailRequest extends pb_1.Message {
    #one_of_decls: number[][] = [];

    constructor(
      data?:
        | any[]
        | {
            gmsAvatarUrl?: string[];
            title?: string;
            episodeTitle?: string;
            episodeIndex?: number;
            backgroundUrl?: string;
            logoUrl?: string;
          },
    ) {
      super();
      pb_1.Message.initialize(
        this,
        Array.isArray(data) ? data : [],
        0,
        -1,
        [1],
        this.#one_of_decls,
      );
      if (!Array.isArray(data) && typeof data == "object") {
        if ("gmsAvatarUrl" in data && data.gmsAvatarUrl != undefined) {
          this.gmsAvatarUrl = data.gmsAvatarUrl;
        }
        if ("title" in data && data.title != undefined) {
          this.title = data.title;
        }
        if ("episodeTitle" in data && data.episodeTitle != undefined) {
          this.episodeTitle = data.episodeTitle;
        }
        if ("episodeIndex" in data && data.episodeIndex != undefined) {
          this.episodeIndex = data.episodeIndex;
        }
        if ("backgroundUrl" in data && data.backgroundUrl != undefined) {
          this.backgroundUrl = data.backgroundUrl;
        }
        if ("logoUrl" in data && data.logoUrl != undefined) {
          this.logoUrl = data.logoUrl;
        }
      }
    }

    get gmsAvatarUrl() {
      return pb_1.Message.getFieldWithDefault(this, 1, []) as string[];
    }

    set gmsAvatarUrl(value: string[]) {
      pb_1.Message.setField(this, 1, value);
    }

    get title() {
      return pb_1.Message.getFieldWithDefault(this, 2, "") as string;
    }

    set title(value: string) {
      pb_1.Message.setField(this, 2, value);
    }

    get episodeTitle() {
      return pb_1.Message.getFieldWithDefault(this, 3, "") as string;
    }

    set episodeTitle(value: string) {
      pb_1.Message.setField(this, 3, value);
    }

    get episodeIndex() {
      return pb_1.Message.getFieldWithDefault(this, 4, 0) as number;
    }

    set episodeIndex(value: number) {
      pb_1.Message.setField(this, 4, value);
    }

    get backgroundUrl() {
      return pb_1.Message.getFieldWithDefault(this, 5, "") as string;
    }

    set backgroundUrl(value: string) {
      pb_1.Message.setField(this, 5, value);
    }

    get logoUrl() {
      return pb_1.Message.getFieldWithDefault(this, 6, "") as string;
    }

    set logoUrl(value: string) {
      pb_1.Message.setField(this, 6, value);
    }

    static fromObject(data: {
      gmsAvatarUrl?: string[];
      title?: string;
      episodeTitle?: string;
      episodeIndex?: number;
      backgroundUrl?: string;
      logoUrl?: string;
    }): ThumbnailRequest {
      const message = new ThumbnailRequest({});
      if (data.gmsAvatarUrl != null) {
        message.gmsAvatarUrl = data.gmsAvatarUrl;
      }
      if (data.title != null) {
        message.title = data.title;
      }
      if (data.episodeTitle != null) {
        message.episodeTitle = data.episodeTitle;
      }
      if (data.episodeIndex != null) {
        message.episodeIndex = data.episodeIndex;
      }
      if (data.backgroundUrl != null) {
        message.backgroundUrl = data.backgroundUrl;
      }
      if (data.logoUrl != null) {
        message.logoUrl = data.logoUrl;
      }
      return message;
    }

    static deserialize(
      bytes: Uint8Array | pb_1.BinaryReader,
    ): ThumbnailRequest {
      const reader =
          bytes instanceof pb_1.BinaryReader
            ? bytes
            : new pb_1.BinaryReader(bytes),
        message = new ThumbnailRequest();
      while (reader.nextField()) {
        if (reader.isEndGroup()) break;
        switch (reader.getFieldNumber()) {
          case 1:
            pb_1.Message.addToRepeatedField(message, 1, reader.readString());
            break;
          case 2:
            message.title = reader.readString();
            break;
          case 3:
            message.episodeTitle = reader.readString();
            break;
          case 4:
            message.episodeIndex = reader.readInt32();
            break;
          case 5:
            message.backgroundUrl = reader.readString();
            break;
          case 6:
            message.logoUrl = reader.readString();
            break;
          default:
            reader.skipField();
        }
      }
      return message;
    }

    static deserializeBinary(bytes: Uint8Array): ThumbnailRequest {
      return ThumbnailRequest.deserialize(bytes);
    }

    toObject() {
      const data: {
        gmsAvatarUrl?: string[];
        title?: string;
        episodeTitle?: string;
        episodeIndex?: number;
        backgroundUrl?: string;
        logoUrl?: string;
      } = {};
      if (this.gmsAvatarUrl != null) {
        data.gmsAvatarUrl = this.gmsAvatarUrl;
      }
      if (this.title != null) {
        data.title = this.title;
      }
      if (this.episodeTitle != null) {
        data.episodeTitle = this.episodeTitle;
      }
      if (this.episodeIndex != null) {
        data.episodeIndex = this.episodeIndex;
      }
      if (this.backgroundUrl != null) {
        data.backgroundUrl = this.backgroundUrl;
      }
      if (this.logoUrl != null) {
        data.logoUrl = this.logoUrl;
      }
      return data;
    }

    serialize(): Uint8Array;

    serialize(w: pb_1.BinaryWriter): void;

    serialize(w?: pb_1.BinaryWriter): Uint8Array | void {
      const writer = w || new pb_1.BinaryWriter();
      if (this.gmsAvatarUrl.length)
        writer.writeRepeatedString(1, this.gmsAvatarUrl);
      if (this.title.length) writer.writeString(2, this.title);
      if (this.episodeTitle.length) writer.writeString(3, this.episodeTitle);
      if (this.episodeIndex != 0) writer.writeInt32(4, this.episodeIndex);
      if (this.backgroundUrl.length) writer.writeString(5, this.backgroundUrl);
      if (this.logoUrl.length) writer.writeString(6, this.logoUrl);
      if (!w) return writer.getResultBuffer();
    }

    serializeBinary(): Uint8Array {
      return this.serialize();
    }
  }

  export class ThumbnailResponse extends pb_1.Message {
    #one_of_decls: number[][] = [];

    constructor(
      data?:
        | any[]
        | {
            thumbnailKey?: string;
          },
    ) {
      super();
      pb_1.Message.initialize(
        this,
        Array.isArray(data) ? data : [],
        0,
        -1,
        [],
        this.#one_of_decls,
      );
      if (!Array.isArray(data) && typeof data == "object") {
        if ("thumbnailKey" in data && data.thumbnailKey != undefined) {
          this.thumbnailKey = data.thumbnailKey;
        }
      }
    }

    get thumbnailKey() {
      return pb_1.Message.getFieldWithDefault(this, 1, "") as string;
    }

    set thumbnailKey(value: string) {
      pb_1.Message.setField(this, 1, value);
    }

    static fromObject(data: { thumbnailKey?: string }): ThumbnailResponse {
      const message = new ThumbnailResponse({});
      if (data.thumbnailKey != null) {
        message.thumbnailKey = data.thumbnailKey;
      }
      return message;
    }

    static deserialize(
      bytes: Uint8Array | pb_1.BinaryReader,
    ): ThumbnailResponse {
      const reader =
          bytes instanceof pb_1.BinaryReader
            ? bytes
            : new pb_1.BinaryReader(bytes),
        message = new ThumbnailResponse();
      while (reader.nextField()) {
        if (reader.isEndGroup()) break;
        switch (reader.getFieldNumber()) {
          case 1:
            message.thumbnailKey = reader.readString();
            break;
          default:
            reader.skipField();
        }
      }
      return message;
    }

    static deserializeBinary(bytes: Uint8Array): ThumbnailResponse {
      return ThumbnailResponse.deserialize(bytes);
    }

    toObject() {
      const data: {
        thumbnailKey?: string;
      } = {};
      if (this.thumbnailKey != null) {
        data.thumbnailKey = this.thumbnailKey;
      }
      return data;
    }

    serialize(): Uint8Array;

    serialize(w: pb_1.BinaryWriter): void;

    serialize(w?: pb_1.BinaryWriter): Uint8Array | void {
      const writer = w || new pb_1.BinaryWriter();
      if (this.thumbnailKey.length) writer.writeString(1, this.thumbnailKey);
      if (!w) return writer.getResultBuffer();
    }

    serializeBinary(): Uint8Array {
      return this.serialize();
    }
  }

  interface GrpcUnaryServiceInterface<P, R> {
    (
      message: P,
      metadata: grpc_1.Metadata,
      options: grpc_1.CallOptions,
      callback: grpc_1.requestCallback<R>,
    ): grpc_1.ClientUnaryCall;

    (
      message: P,
      metadata: grpc_1.Metadata,
      callback: grpc_1.requestCallback<R>,
    ): grpc_1.ClientUnaryCall;

    (
      message: P,
      options: grpc_1.CallOptions,
      callback: grpc_1.requestCallback<R>,
    ): grpc_1.ClientUnaryCall;

    (message: P, callback: grpc_1.requestCallback<R>): grpc_1.ClientUnaryCall;
  }

  interface GrpcStreamServiceInterface<P, R> {
    (
      message: P,
      metadata: grpc_1.Metadata,
      options?: grpc_1.CallOptions,
    ): grpc_1.ClientReadableStream<R>;

    (message: P, options?: grpc_1.CallOptions): grpc_1.ClientReadableStream<R>;
  }

  interface GrpWritableServiceInterface<P, R> {
    (
      metadata: grpc_1.Metadata,
      options: grpc_1.CallOptions,
      callback: grpc_1.requestCallback<R>,
    ): grpc_1.ClientWritableStream<P>;

    (
      metadata: grpc_1.Metadata,
      callback: grpc_1.requestCallback<R>,
    ): grpc_1.ClientWritableStream<P>;

    (
      options: grpc_1.CallOptions,
      callback: grpc_1.requestCallback<R>,
    ): grpc_1.ClientWritableStream<P>;

    (callback: grpc_1.requestCallback<R>): grpc_1.ClientWritableStream<P>;
  }

  interface GrpcChunkServiceInterface<P, R> {
    (
      metadata: grpc_1.Metadata,
      options?: grpc_1.CallOptions,
    ): grpc_1.ClientDuplexStream<P, R>;

    (options?: grpc_1.CallOptions): grpc_1.ClientDuplexStream<P, R>;
  }

  interface GrpcPromiseServiceInterface<P, R> {
    (
      message: P,
      metadata: grpc_1.Metadata,
      options?: grpc_1.CallOptions,
    ): Promise<R>;

    (message: P, options?: grpc_1.CallOptions): Promise<R>;
  }

  export abstract class UnimplementedThumbnailService {
    static definition = {
      CreateThumbnail: {
        path: "/thumbnail.Thumbnail/CreateThumbnail",
        requestStream: false,
        responseStream: false,
        requestSerialize: (message: ThumbnailRequest) =>
          Buffer.from(message.serialize()),
        requestDeserialize: (bytes: Buffer) =>
          ThumbnailRequest.deserialize(new Uint8Array(bytes)),
        responseSerialize: (message: ThumbnailResponse) =>
          Buffer.from(message.serialize()),
        responseDeserialize: (bytes: Buffer) =>
          ThumbnailResponse.deserialize(new Uint8Array(bytes)),
      },
    };

    [method: string]: grpc_1.UntypedHandleCall;

    abstract CreateThumbnail(
      call: grpc_1.ServerUnaryCall<ThumbnailRequest, ThumbnailResponse>,
      callback: grpc_1.sendUnaryData<ThumbnailResponse>,
    ): void;
  }

  export class ThumbnailClient extends grpc_1.makeGenericClientConstructor(
    UnimplementedThumbnailService.definition,
    "Thumbnail",
    {},
  ) {
    constructor(
      address: string,
      credentials: grpc_1.ChannelCredentials,
      options?: Partial<grpc_1.ChannelOptions>,
    ) {
      super(address, credentials, options);
    }

    CreateThumbnail: GrpcUnaryServiceInterface<
      ThumbnailRequest,
      ThumbnailResponse
    > = (
      message: ThumbnailRequest,
      metadata:
        | grpc_1.Metadata
        | grpc_1.CallOptions
        | grpc_1.requestCallback<ThumbnailResponse>,
      options?: grpc_1.CallOptions | grpc_1.requestCallback<ThumbnailResponse>,
      callback?: grpc_1.requestCallback<ThumbnailResponse>,
    ): grpc_1.ClientUnaryCall => {
      return super.CreateThumbnail(message, metadata, options, callback);
    };
  }
}
