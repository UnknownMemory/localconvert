# localconvert
[![en](https://img.shields.io/badge/lang-English-blue)](README.md)
[![fr](https://img.shields.io/badge/lang-Français-red)](README.fr-FR.md)
## Protocole
### Paquet
```
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
| Header de 12 octets | Filename | Options | Payload  |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
```
### Header
```
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
| Magic (2 octets)  | Version (1 octet) | OpCode (1 octet)  |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|    Filename (2 octets)    |     Options (2 octets)        |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                Payload Size (4 octets)                    |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
```
#### Spécifications
| Nom      | Taille   | Description                      |
|----------|--------- |--------------------------------  |
| Magic    | 2 octets | Identifiant du protocole (L, C)  |
| Version  | 1 octet  | Version du protocole             |
| OpCode   | 1 octet  | Identifiant de l'opération       |
| Filename | 2 octets | Longueur du nom du fichier       |
| Options  | 2 octets | Longueur de la commande `ffmpeg` |
| Payload  | 4 octets | Taille du payload                |

#### OpCodes
| Nom          | Valeur | Description                                              |
|--------------|------- |----------------------------------------------------------|
| FileConvert  | 0x01   | Conversion de fichier                                    |
| FileTransfer | 0x02   | Transmission/Réception de fichier                        |
| Processing   | 0x03   | Signalement d'un traitement de fichier au un client      |
| Error        | 0x04   | Signalement d'une erreur serveur                         |
