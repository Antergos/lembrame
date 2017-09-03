#!/usr/bin/env python3

"""
    Copyright 2017 Antergos
    Copyright 2015 Shawn Kinkade

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
"""

import sys
import os

try:
    import libnacl
except ImportError:
    sys.stderr.write('Please install libnacl')
    exit()

import uuid
import libnacl.utils

APP_MAGICNUM = b'LEMBRAME0'
LEN_MAGICNUM = 9
LEN_NONCE = 24
LEN_KEY = 32
LEN_PROT_BOX = 72

sha256 = libnacl.crypto_hash_sha256
sha512 = libnacl.crypto_hash_sha512
rand_nonce = libnacl.utils.rand_nonce
salsa_key = libnacl.utils.salsa_key
secretbox = libnacl.crypto_secretbox
secretbox_open = libnacl.crypto_secretbox_open

# Plaintext passwords confined to one local scope

def get_enc_hash():
    enc_pass = str(uuid.uuid4())
    saltnonce = rand_nonce()
    return sha512(saltnonce + enc_pass.encode('utf-8')), saltnonce, enc_pass


def get_dec_hash(user_input):
    dec_pass = sys.argv[3]
    if 8 <= len(dec_pass) <= 100:
        user_input.seek(LEN_MAGICNUM)
        saltnonce = user_input.read(LEN_NONCE)
        return sha512(saltnonce + dec_pass.encode('utf-8')), saltnonce
    else:
        sys.stderr.write('Password is of unreasonable length')
        exit()


# Intensive but not too noticeable

def kdf(pass_hash, salt):
    for i in range(2, 2 ** 17):
        pass_hash = sha512(salt + pass_hash)
    return sha256(salt + pass_hash)


# Random key is protected with user-generated key

def sv_enc(plaindata, user_output):
    pass_hash, saltnonce, plaintext = get_enc_hash()
    prot_key = kdf(pass_hash, saltnonce)

    data_key = salsa_key()
    data_nonce = rand_nonce()
    prot_box = secretbox(data_nonce + data_key, saltnonce, prot_key)

    try:
        cipherdata = open(user_output, 'xb')
    except IOError:
        sys.stderr.write('Output file already exists')
        exit()

    cipherdata.write(APP_MAGICNUM
                     + saltnonce
                     + prot_box
                     + secretbox(plaindata.read(), data_nonce, data_key))
    print(plaintext)


def sv_dec(cipherdata, user_output):
    pass_hash, saltnonce = get_dec_hash(cipherdata)
    prot_key = kdf(pass_hash, saltnonce)

    cipherdata.seek(LEN_MAGICNUM + LEN_NONCE)
    prot_box = cipherdata.read(LEN_PROT_BOX)

    try:
        prot_keynonce = secretbox_open(prot_box, saltnonce, prot_key)
    except ValueError:
        sys.stderr.write('Incorrect password')
        exit()

    data_nonce = prot_keynonce[0:LEN_NONCE]
    data_key = prot_keynonce[LEN_NONCE:LEN_NONCE + LEN_KEY]

    cipherdata.seek(LEN_MAGICNUM + LEN_NONCE + LEN_PROT_BOX)

    try:
        plaindata = open(user_output, 'xb')
    except IOError:
        sys.stderr.write('Output file already exists')
        exit()

    plaindata.write(secretbox_open(cipherdata.read(), data_nonce, data_key))


def clean(file):
    os.remove(file)


if __name__ == '__main__':
    user_input = ''

    if len(sys.argv) < 3:
        print('Lembrame encrypt/decrypt: A simple NaCl file encryption utility forked from Saltvault\n')
        print('Usage:\n   ', str(sys.argv[0]), 'input_file output_file <password>\n')
        print('<password>: only neccessary for decryption.\n')
        exit()

    try:
        user_input = open(str(sys.argv[1]), 'rb')
    except IOError:
        sys.stderr.write('Input file not found')
        exit()

    if user_input.read(LEN_MAGICNUM) == APP_MAGICNUM:
        sv_dec(user_input, str(sys.argv[2]))
    else:
        user_input.seek(0)
        sv_enc(user_input, str(sys.argv[2]))

    clean(sys.argv[1])
