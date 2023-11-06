// package: thumbnail
// file: thumbnail.proto

/* tslint:disable */
/* eslint-disable */

import * as grpc from "@grpc/grpc-js";
import * as thumbnail_pb from "./thumbnail_pb";

interface IThumbnailService extends grpc.ServiceDefinition<grpc.UntypedServiceImplementation> {
    createThumbnail: IThumbnailService_ICreateThumbnail;
}

interface IThumbnailService_ICreateThumbnail extends grpc.MethodDefinition<thumbnail_pb.ThumbnailRequest, thumbnail_pb.ThumbnailResponse> {
    path: "/thumbnail.Thumbnail/CreateThumbnail";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<thumbnail_pb.ThumbnailRequest>;
    requestDeserialize: grpc.deserialize<thumbnail_pb.ThumbnailRequest>;
    responseSerialize: grpc.serialize<thumbnail_pb.ThumbnailResponse>;
    responseDeserialize: grpc.deserialize<thumbnail_pb.ThumbnailResponse>;
}

export const ThumbnailService: IThumbnailService;

export interface IThumbnailServer extends grpc.UntypedServiceImplementation {
    createThumbnail: grpc.handleUnaryCall<thumbnail_pb.ThumbnailRequest, thumbnail_pb.ThumbnailResponse>;
}

export interface IThumbnailClient {
    createThumbnail(request: thumbnail_pb.ThumbnailRequest, callback: (error: grpc.ServiceError | null, response: thumbnail_pb.ThumbnailResponse) => void): grpc.ClientUnaryCall;
    createThumbnail(request: thumbnail_pb.ThumbnailRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: thumbnail_pb.ThumbnailResponse) => void): grpc.ClientUnaryCall;
    createThumbnail(request: thumbnail_pb.ThumbnailRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: thumbnail_pb.ThumbnailResponse) => void): grpc.ClientUnaryCall;
}

export class ThumbnailClient extends grpc.Client implements IThumbnailClient {
    constructor(address: string, credentials: grpc.ChannelCredentials, options?: Partial<grpc.ClientOptions>);
    public createThumbnail(request: thumbnail_pb.ThumbnailRequest, callback: (error: grpc.ServiceError | null, response: thumbnail_pb.ThumbnailResponse) => void): grpc.ClientUnaryCall;
    public createThumbnail(request: thumbnail_pb.ThumbnailRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: thumbnail_pb.ThumbnailResponse) => void): grpc.ClientUnaryCall;
    public createThumbnail(request: thumbnail_pb.ThumbnailRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: thumbnail_pb.ThumbnailResponse) => void): grpc.ClientUnaryCall;
}
