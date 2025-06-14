export function encodeBinary(text: string): string {
    const encoder = new TextEncoder();
    const encoded = encoder.encode(text);
    return Array.from(encoded)
        .map((byte) => byte.toString(16).padStart(2, "0"))
        .join("");
}

export function decodeBinary(hexStr: string): string {
    const bytes = new Uint8Array(
        hexStr.match(/.{1,2}/g)?.map((byte) => parseInt(byte, 16)) || []
    );
    const decoder = new TextDecoder();
    return decoder.decode(bytes);
}

export function hexToBinary(hexStr: string): Uint8Array {
    if (hexStr.length % 2 !== 0) {
        throw new Error("Invalid hex string: length must be even");
    }
    const byteLength = hexStr.length / 2;
    const bytes = new Uint8Array(byteLength);
    for (let i = 0; i < byteLength; i++) {
        bytes[i] = parseInt(hexStr.substr(i * 2, 2), 16);
    }
    return bytes;
}
