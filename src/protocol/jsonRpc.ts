//JSON-RPC envolope types

type JsonRpcParams = {
  owner: string;
  repo: string;
  //adding more optional params later
};

type ResponseResult = {
    //the result will vary based on each tool
};

type ErrorCode = -32700 | -32600 | -32601 | -32602 | -32603 | -32000;

type ErrorMessage =
  | "Parse error"
  | "Invalid Request"
  | "Method not found"
  | "Invalid params"
  | "Internal error"
  | "Server error";

type ResponseError = {
  code: ErrorCode;
  message: ErrorMessage;
  data?: object;
};

interface JsonRpcRequest {
  jsonrpc: "2.0";
  id?: number | string;
  method: string;
  params?: JsonRpcParams;
}

interface JsonRpcSuccess {
  jsonrpc: "2.0";
  id: number | string | null;
  result?: ResponseResult;
  error?: never;
}

interface JsonRpcFailure {
  jsonrpc: "2.0";
  id: number | string | null;
  result?: never;
  error?: ResponseError;
}

type JsonRpcResponse = JsonRpcSuccess | JsonRpcFailure;
