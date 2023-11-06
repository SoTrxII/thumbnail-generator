// GENERATED CODE -- DO NOT EDIT!

'use strict';
var grpc = require('@grpc/grpc-js');
var thumbnail_pb = require('./thumbnail_pb.js');

function serialize_thumbnail_ThumbnailRequest(arg) {
  if (!(arg instanceof thumbnail_pb.ThumbnailRequest)) {
    throw new Error('Expected argument of type thumbnail.ThumbnailRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_thumbnail_ThumbnailRequest(buffer_arg) {
  return thumbnail_pb.ThumbnailRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_thumbnail_ThumbnailResponse(arg) {
  if (!(arg instanceof thumbnail_pb.ThumbnailResponse)) {
    throw new Error('Expected argument of type thumbnail.ThumbnailResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_thumbnail_ThumbnailResponse(buffer_arg) {
  return thumbnail_pb.ThumbnailResponse.deserializeBinary(new Uint8Array(buffer_arg));
}


var ThumbnailService = exports.ThumbnailService = {
  createThumbnail: {
    path: '/thumbnail.Thumbnail/CreateThumbnail',
    requestStream: false,
    responseStream: false,
    requestType: thumbnail_pb.ThumbnailRequest,
    responseType: thumbnail_pb.ThumbnailResponse,
    requestSerialize: serialize_thumbnail_ThumbnailRequest,
    requestDeserialize: deserialize_thumbnail_ThumbnailRequest,
    responseSerialize: serialize_thumbnail_ThumbnailResponse,
    responseDeserialize: deserialize_thumbnail_ThumbnailResponse,
  },
};

exports.ThumbnailClient = grpc.makeGenericClientConstructor(ThumbnailService);
