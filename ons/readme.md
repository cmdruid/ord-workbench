ONS - Ordinal Naming System
=====

### (1) Start the dns server
This is a typical DNS server running on UDP 53 (default dns port) except it also forwards ons mappings.

1. `sudo su`
2. `cd ons && node dns-server.js`

### (2) Serve up a test ONS mapping
Serve up an ONS mapping, like `http://crazyostrich19.ord`
`npm run start:ordwebtest`

### (3) Configure your local machine to use our DNS server

Our custom DNS server runs on 127.0.0.1 on UPD 53

To change your DNS server on mac
1. System preferences > network > click wifi (or eth or whatever nic card you are using) > advanced > dns tab > +
2. open `http://crazyostrich19.ord` (you can edit this mapping in `ons/dns-server.js` under domains line 52)









ORD Workbench Notes
==============

Remote into ORD
--------------
`docker exec -it ord-bitcoin bash`

Setup
-------
1. load bitcoin wallet
2. mine blocks
3. ord -r --index-sats index
4. ord -r wallet create
  `cinnamon renew spare hockey mirror unhappy enjoy ignore excite spare nephew scrap`
5. ord -r wallet sats
    - if error `rm /root/.local/share/ord/regtest/index.redb`
    - then `ord -r --index-sats index`
6. ord -r wallet receive

ORD Server
-------
1. server `tmux new -s server ord -r server`
2. ctl + b then d
3. on host `open http://localhost:3069`


Test the scheme
---------------
0 charanga enamelists 000 [0,1]
1 charanga ambushed [0,2]
2 charanga ambushed [0,3]
3 charanga pale [0,4]
...
174,194 charanga falx [0, n] n=179,143
