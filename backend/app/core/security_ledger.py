import hashlib
import json
import sqlite3
import time
from typing import Dict, Any, List

class PolarSecurityLedger:
    def __init__(self, db_path: str = "aetheris_polar_ledger.db"):
        self.db_path = db_path
        self._init_db()

    def _init_db(self):
        with sqlite3.connect(self.db_path) as conn:
            conn.execute("""
                CREATE TABLE IF NOT EXISTS polar_audit_ledger (
                    block_index INTEGER PRIMARY KEY AUTOINCREMENT,
                    timestamp REAL NOT NULL,
                    iso_time TEXT NOT NULL,
                    station_code TEXT NOT NULL,
                    fsm_state TEXT NOT NULL,
                    fuel_flow_lph REAL NOT NULL,
                    co2_mitigated_kg REAL NOT NULL,
                    exergy_efficiency_pct REAL NOT NULL,
                    payload_json TEXT NOT NULL,
                    prev_hash TEXT NOT NULL,
                    current_hash TEXT NOT NULL
                )
            """)
            conn.commit()

    def get_last_hash(self) -> str:
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT current_hash FROM polar_audit_ledger ORDER BY block_index DESC LIMIT 1")
            row = cursor.fetchone()
            return row[0] if row else "GENESIS_NCPOR_POLAR_BLOCK_000000000000000000000000000000000"

    def record_event(self, station_code: str, fsm_state: str, fuel_flow_lph: float, co2_mitigated_kg: float, exergy_efficiency_pct: float, payload: Dict[str, Any]) -> Dict[str, Any]:
        prev_hash = self.get_last_hash()
        ts = time.time()
        iso_time = time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime(ts))
        payload_str = json.dumps(payload, sort_keys=True)

        # Cryptographic SHA-256 Merkle Block
        block_content = f"{ts}|{station_code}|{fsm_state}|{fuel_flow_lph:.3f}|{co2_mitigated_kg:.3f}|{exergy_efficiency_pct:.2f}|{payload_str}|{prev_hash}"
        current_hash = hashlib.sha256(block_content.encode('utf-8')).hexdigest()

        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO polar_audit_ledger 
                (timestamp, iso_time, station_code, fsm_state, fuel_flow_lph, co2_mitigated_kg, exergy_efficiency_pct, payload_json, prev_hash, current_hash)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (ts, iso_time, station_code, fsm_state, fuel_flow_lph, co2_mitigated_kg, exergy_efficiency_pct, payload_str, prev_hash, current_hash))
            conn.commit()
            block_idx = cursor.lastrowid

        return {
            "block_index": block_idx,
            "iso_time": iso_time,
            "prev_hash": prev_hash,
            "current_hash": current_hash,
            "verified": True
        }

    def verify_ledger_integrity(self) -> Dict[str, Any]:
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT block_index, timestamp, station_code, fsm_state, fuel_flow_lph, co2_mitigated_kg, exergy_efficiency_pct, payload_json, prev_hash, current_hash FROM polar_audit_ledger ORDER BY block_index ASC")
            rows = cursor.fetchall()

        if not rows:
            return {"status": "EMPTY", "blocks_verified": 0, "tamper_detected": False}

        expected_prev = "GENESIS_NCPOR_POLAR_BLOCK_000000000000000000000000000000000"
        for row in rows:
            b_idx, ts, st_code, fsm, fuel, co2, ex_eff, p_json, p_hash, c_hash = row
            if p_hash != expected_prev:
                return {"status": "TAMPERED", "tamper_block": b_idx, "tamper_detected": True}
            
            recomputed = hashlib.sha256(f"{ts}|{st_code}|{fsm}|{fuel:.3f}|{co2:.3f}|{ex_eff:.2f}|{p_json}|{p_hash}".encode('utf-8')).hexdigest()
            if recomputed != c_hash:
                return {"status": "HASH_MISMATCH", "tamper_block": b_idx, "tamper_detected": True}
            
            expected_prev = c_hash

        return {"status": "VERIFIED_SEC_65B", "blocks_verified": len(rows), "tamper_detected": False}
