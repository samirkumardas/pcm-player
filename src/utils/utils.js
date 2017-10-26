export function appendByteArray(buffer1, buffer2) {
    let tmp = new Uint8Array((buffer1.length|0) + (buffer2.length|0));
    tmp.set(buffer1, 0);
    tmp.set(buffer2, buffer1.length|0);
    return tmp;
}
