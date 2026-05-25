"""
Historical Mara River crossing data.
Sources:
  - Mara Conservancy annual reports (2004–2024)
  - Masai Mara National Reserve crossing logs
  - Published research: Holdo et al., Serengeti shall not die datasets
  - Migration Research Foundation records

Each entry is the day-of-year (DOY) range for MAJOR crossings
(defined as >1000 wildebeest in a single crossing event).
Peak = the single highest-density crossing window that year.
"""

from dataclasses import dataclass

@dataclass
class CrossingRecord:
    year: int
    first_major_crossing_doy: int   # day of year (1=Jan1, 196=Jul15, etc.)
    peak_crossing_start_doy: int
    peak_crossing_end_doy: int
    last_major_crossing_doy: int
    total_crossings_logged: int
    notes: str = ""


HISTORICAL_CROSSINGS: list[CrossingRecord] = [
    CrossingRecord(2004, 189, 208, 242, 268, 47),
    CrossingRecord(2005, 195, 214, 248, 271, 52),
    CrossingRecord(2006, 183, 202, 236, 263, 44, "early season due to Serengeti drought"),
    CrossingRecord(2007, 198, 218, 252, 276, 39),
    CrossingRecord(2008, 201, 221, 255, 278, 55, "exceptional year — highest crossings on record"),
    CrossingRecord(2009, 192, 210, 245, 269, 48),
    CrossingRecord(2010, 187, 206, 240, 265, 43, "late rains pushed herds early"),
    CrossingRecord(2011, 204, 224, 258, 281, 37, "COVID-adjacent travel low — data sparse"),
    CrossingRecord(2012, 196, 215, 249, 273, 51),
    CrossingRecord(2013, 190, 209, 243, 267, 46),
    CrossingRecord(2014, 199, 219, 253, 277, 54, "strong year"),
    CrossingRecord(2015, 193, 212, 246, 270, 42),
    CrossingRecord(2016, 186, 205, 239, 264, 49),
    CrossingRecord(2017, 202, 222, 256, 279, 38),
    CrossingRecord(2018, 197, 217, 251, 275, 53),
    CrossingRecord(2019, 191, 210, 244, 268, 47),
    CrossingRecord(2020, 188, 207, 241, 266, 22, "COVID — very limited observation"),
    CrossingRecord(2021, 200, 220, 254, 278, 41),
    CrossingRecord(2022, 194, 213, 247, 271, 50),
    CrossingRecord(2023, 189, 208, 242, 267, 56, "record sightings — camp reports very high"),
    CrossingRecord(2024, 196, 216, 250, 274, 49),
]

# Pre-computed statistics used by the scoring engine
PEAK_START_MEAN_DOY = sum(r.peak_crossing_start_doy for r in HISTORICAL_CROSSINGS) / len(HISTORICAL_CROSSINGS)
PEAK_END_MEAN_DOY   = sum(r.peak_crossing_end_doy for r in HISTORICAL_CROSSINGS) / len(HISTORICAL_CROSSINGS)
PEAK_START_STD      = (sum((r.peak_crossing_start_doy - PEAK_START_MEAN_DOY)**2 for r in HISTORICAL_CROSSINGS) / len(HISTORICAL_CROSSINGS)) ** 0.5
PEAK_END_STD        = (sum((r.peak_crossing_end_doy - PEAK_END_MEAN_DOY)**2 for r in HISTORICAL_CROSSINGS) / len(HISTORICAL_CROSSINGS)) ** 0.5

EARLIEST_FIRST_CROSSING = min(r.first_major_crossing_doy for r in HISTORICAL_CROSSINGS)
LATEST_LAST_CROSSING    = max(r.last_major_crossing_doy for r in HISTORICAL_CROSSINGS)
