declare global {
  interface XMLHttpRequest {
    _url?: string;
    _method?: string;
    _headers?: any;
    _st?: number;
  }

  interface GlobalThis {
    _originalXHR?: typeof XMLHttpRequest;
  }
}
const _getGlobal = (): (GlobalThis & typeof globalThis) | undefined =>
  typeof globalThis !== "undefined"
    ? globalThis
    : typeof window !== "undefined"
    ? window
    : typeof global !== "undefined"
    ? global
    : undefined;

export function setupXHRInterceptor(): void {
  const globalScope = _getGlobal();
  if (
    !globalScope ||
    typeof globalScope.XMLHttpRequest === "undefined" ||
    globalScope._originalXHR
  ) {
    console.warn(
      "[Network Interceptor] Skipped: XMLHttpRequest is not defined or already intercepted."
    );
    return;
  }

  const XMLHttpRequest = globalScope.XMLHttpRequest;

  globalScope._originalXHR = XMLHttpRequest;

  const originalOpen = XMLHttpRequest.prototype.open;
  const originalSend = XMLHttpRequest.prototype.send;

  XMLHttpRequest.prototype.open = function (...params: any[]): void {
    this._url =
      typeof params?.[1] === "string" ? params?.[1] : params?.[1]?.toString();
    this._method =
      typeof params?.[0] === "string" ? params?.[0] : params?.[0]?.toString();
    return originalOpen.apply(this, arguments as any);
  };

  XMLHttpRequest.prototype.send = function (
    body?: Document | BodyInit | null
  ): void {
    this._st = new Date().getTime();
    try {
      this.setRequestHeader("X-API-KEY", "Mostafa Gomaa");
    } catch (e) {
      console.warn("[Network Interceptor] Could not set header:", e);
    }

    this.addEventListener("load", function () {
      console.log(
        `[Network Interceptor] time:`,
        this._st ? new Date().getTime() - this._st : 0
      );
      console.log(`[Network Interceptor] url:`, this._url);
      console.log(`[Network Interceptor] status:`, this.status);
      console.log(`[Network Interceptor] req body:`, body);
      console.log(`[Network Interceptor] req headers:`, this._headers);
      console.log(`[Network Interceptor] res body:`, this.responseText);
      console.log(
        `[Network Interceptor] res headers:`,
        this.getAllResponseHeaders()
      );
    });

    this.addEventListener("error", function () {
      console.error(`[Network Interceptor] Network error from: ${this._url}`);
    });

    return originalSend.apply(this, arguments as any);
  };

  console.log("[Network Interceptor] Installed.");
}
