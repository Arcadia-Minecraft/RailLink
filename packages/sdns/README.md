# RailLink/SDHCP – Simple Dynamic Host Configuration Protocol

SDHCP ist ein vereinfachtes, DHCP-ähnliches Protokoll, das speziell für die Vergabe von IP-Adressen in einem Netzwerk von OpenComputers (in einer modifizierten Minecraft-Welt) konzipiert wurde. Es basiert auf 64-Bit-Adressen, die in vier 16-Bit-Segmenten dargestellt werden, und unterstützt Subnetze mittels Präfixlängen.

---

## 1. 64-Bit-Adressen mit 4 Segmenten

- **Adressaufbau:**
  - Insgesamt 64 Bit, aufgeteilt in 4 Segmente à 16 Bit.
  - Jedes Segment kann Werte von 0 bis 65535 annehmen.

- **Darstellung:**
  - **Punkt-Notation (Dezimalsystem):**  
    `Segment1.Segment2.Segment3.Segment4`  
    (Beispiel: `0.10.1024.65535`)
  - **Doppelpunkt-Notation (Hexadezimalsystem):**  
    `Segment1:Segment2:Segment3:Segment4`  
    (Beispiel: `0:0A:0400:FFFF`)

---

## 2. Subnetz-Unterstützung

- **Präfixlänge:**
  - Eine Zahl zwischen 0 und 64, die angibt, wie viele der linken Bits als Netzwerkanteil gelten.
  - Beispiel: `/48` bedeutet, dass die ersten 48 Bits das Netzwerk definieren und die restlichen 16 Bit für Hosts genutzt werden.

- **Subnetzmasken-Notation:**
  - Analog zur klassischen IPv4-Notation, z. B. entspricht `/48` der Maske `FFFF:FFFF:FFFF:0000`.

- **Adresspools:**
  - Der SDHCP-Server führt für jedes Subnetz einen eigenen Adresspool.
  - Konfiguration erfolgt über eine Basisadresse (Netzwerkadresse) und die Präfixlänge.
  - Bei der Anfrage kann der Client optional eine gewünschte Präfixlänge (oder Subnetz) angeben.

---

## 3. Vereinfachter DORA-Handshake (mit Subnetzfeldern)

Der klassische DORA-Handshake (Discover, Offer, Request, Acknowledge) wird beibehalten, jedoch um Subnetzinformationen erweitert.

### Discover

- **Beschreibung:**  
  Der Client sendet ein Broadcast-Paket, um eine IP-Adresse anzufordern. Optional kann dabei eine gewünschte Präfixlänge mitgegeben werden.

- **Beispiel (JSON):**
  ```json
  {
      "type": "DHCP_DISCOVER",
      "client_id": "<unique_client_id>",
      "desired_prefix_length": 48
  }
  ```

### Offer

- **Beschreibung:**  
  Jeder DHCP-Server empfängt das Discover und ermittelt, aus welchem Subnetz er eine Adresse zuweisen kann. Anschließend sendet der Server ein Angebot (Offer) zurück, das die 64-Bit-Adresse sowie die Präfixlänge enthält.

- **Beispiel (JSON):**
  ```json
  {
    "type": "DHCP_OFFER",
    "server_id": "<server_identifier>",
    "client_id": "<unique_client_id>",
    "offered_address": {
      "segment1": 0,
      "segment2": 10,
      "segment3": 1024,
      "segment4": 65535
    },
    "prefix_length": 48,
    "lease_time": 3600
  }
  ```

### Request

- **Beschreibung:**  
  Der Client prüft das Angebot und bestätigt seine Auswahl, indem er eine Anfrage (Request) an den Server sendet. Auch hier wird die Präfixlänge übermittelt.

- **Beispiel (JSON):**
  ```json
  {
    "type": "DHCP_REQUEST",
    "server_id": "<server_identifier>",
    "client_id": "<unique_client_id>",
    "requested_address": {
      "segment1": 0,
      "segment2": 10,
      "segment3": 1024,
      "segment4": 65535
    },
    "prefix_length": 48
  }
  ```

### Acknowledge

- **Beschreibung:**  
  Der Server bestätigt den Lease, trägt die Adresszuweisung in seine interne Tabelle ein und sendet eine Bestätigung (ACK) an den Client.

- **Beispiel (JSON):**
  ```json
  {
    "type": "DHCP_ACK",
    "server_id": "<server_identifier>",
    "client_id": "<unique_client_id>",
    "assigned_address": {
      "segment1": 0,
      "segment2": 10,
      "segment3": 1024,
      "segment4": 65535
    },
    "prefix_length": 48,
    "lease_time": 3600
  }
  ```

---

## 4. Datenstrukturen und Logik

### Server: Adressverwaltung pro Subnetz

- **Beispielhafte interne Datenstruktur:**
  ```lua
  subnets = {
    {
      base_address  = {0, 10, 1024, 0},   -- "Netzwerk"-Anteil bei /48
      prefix_length = 48,
      pool_start    = 0,                  -- Start des Host-Bereichs in den letzten 16 Bits
      pool_end      = 65535,              -- Ende des Host-Bereichs
      leases        = {}                  -- Mappt Adresse → { client_id, expiry }
    }
  }
  ```

---

## 5. Warum dieses Design funktioniert

- **Klare Trennung:**  
  Das Präfix (z. B. `/48`) definiert eindeutig, welche Bits für das Netzwerk und welche für den Host verwendet werden.
- **Subnetzunterstützung:**  
  Mehrere Subnetze können parallel betrieben werden.
- **Eindeutige Adressvergabe:**  
  Der Server stellt sicher, dass Adressen innerhalb eines Subnetzes eindeutig zugewiesen werden.
- **Skalierbarkeit:**  
  Mit 64-Bit-Adressen stehen wesentlich mehr Adressen zur Verfügung als bei herkömmlichem IPv4.
- **Vertrauter Ablauf:**  
  Der DORA-Handshake bleibt bestehen.
- **Erweiterbarkeit:**  
  Zusätzliche Felder wie Gateway oder DNS-Server können problemlos integriert werden.

---

## 6. Zusammenfassung

1. **Discover:**  Der Client sendet ein Broadcast, um eine Adresse anzufordern.
2. **Offer:**  Der Server wählt eine Adresse und sendet ein Angebot.
3. **Request:**  Der Client bestätigt die Auswahl.
4. **Acknowledge:**  Der Server bestätigt die Zuordnung.

---

Diese Auszüge basieren auf den Inhalten des "Arcadia - Planung IT" Dokuments, das SDHCP und dessen Einsatz im Netzwerk für OpenComputers detailliert beschreibt.

