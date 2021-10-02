import hashlib
import os
from binascii import hexlify, unhexlify
from cryptography.hazmat.primitives.ciphers.aead import AESGCM


passphrase = "u4iEB20fexsf"

def deriveKey(passphrase: str, salt: bytes=None) -> [str, bytes]:    
    if salt is None:
        salt = os.urandom(8)
    return hashlib.pbkdf2_hmac("sha256", passphrase.encode("utf8"), salt, 1000), salt

def encrypt(plaintext: str) -> str:
    key, salt = deriveKey(passphrase)
    aes = AESGCM(key)
    iv = os.urandom(12)
    plaintext = plaintext.encode("utf8")
    ciphertext = aes.encrypt(iv, plaintext, None)
    return "%s-%s-%s" % (hexlify(salt).decode("utf8"), hexlify(iv).decode("utf8"), hexlify(ciphertext).decode("utf8"))


def decrypt(ciphertext: str) -> str:
    salt, iv, ciphertext = map(unhexlify, ciphertext.split("-"))
    key, _ = deriveKey(passphrase, salt)
    aes = AESGCM(key)
    plaintext = aes.decrypt(iv, ciphertext, None)
    return plaintext.decode("utf8")


# if __name__ == "__main__":
#     ciphertext = encrypt("kalebe")
#     print(ciphertext)
#     print(decrypt(ciphertext))
#     # print(decrypt("Qo6tE0jT38tUwkFDnYsHhmL+3inHFgeOrHZ5cP8cs4g="))
    