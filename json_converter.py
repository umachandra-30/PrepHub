import os
import json
import pandas as pd

# ----------------------------
# Input & Output Folders
# ----------------------------

INPUT_FOLDER = "datasets"
OUTPUT_FOLDER = "JSON-TRAIL"

os.makedirs(OUTPUT_FOLDER, exist_ok=True)

# ----------------------------
# Category Names
# ----------------------------

categories = [
    "Technical",
    "Aptitude",
    "Reasoning",
    "Verbal"
]

# ----------------------------
# Subject -> Category Mapping
# ----------------------------

mapping = {

    # ---------- Technical ----------
    "DBMS": "Technical",
    "Operating Systems": "Technical",
    "OS": "Technical",
    "Computer Networks": "Technical",
    "CN": "Technical",
    "OOPs": "Technical",
    "Java": "Technical",
    "Python": "Technical",
    "SQL": "Technical",
    "Data Structures": "Technical",
    "Algorithms": "Technical",
    "DSA": "Technical",
    "C": "Technical",
    "C++": "Technical",

    # ---------- Aptitude ----------
    "Percentages": "Aptitude",
    "Profit & Loss": "Aptitude",
    "Ratio & Proportion": "Aptitude",
    "Probability": "Aptitude",
    "Time & Work": "Aptitude",
    "Time, Speed & Distance": "Aptitude",
    "Simple Interest": "Aptitude",
    "Compound Interest": "Aptitude",
    "Permutation & Combination": "Aptitude",
    "Permutations & Combinations": "Aptitude",
    "Averages": "Aptitude",
    "Mixtures & Alligations": "Aptitude",

    # ---------- Reasoning ----------
    "Blood Relations": "Reasoning",
    "Coding-Decoding": "Reasoning",
    "Direction Sense": "Reasoning",
    "Number Series": "Reasoning",
    "Puzzles": "Reasoning",
    "Logical Sequence": "Reasoning",
    "Seating Arrangement": "Reasoning",
    "Syllogisms": "Reasoning",
    "Statement & Conclusion": "Reasoning",
    "Analogies": "Reasoning",

    # ---------- Verbal ----------
    "Synonyms & Antonyms": "Verbal",
    "Reading Comprehension": "Verbal",
    "Error Spotting": "Verbal",
    "Sentence Improvement": "Verbal",
    "Fill in the Blanks": "Verbal"
}

# ----------------------------
# Supported Encodings
# ----------------------------

encodings = [
    "utf-8",
    "utf-8-sig",
    "cp1252",
    "latin1"
]

# ----------------------------
# Process Every CSV
# ----------------------------

for file in os.listdir(INPUT_FOLDER):

    if not file.endswith(".csv"):
        continue

    path = os.path.join(INPUT_FOLDER, file)

    print(f"\nProcessing {file}")

    df = None

    # Try multiple encodings
    for enc in encodings:

        try:
            df = pd.read_csv(path, encoding=enc)
            print(f"✓ Read using {enc}")
            break

        except Exception:
            pass

    if df is None:
        print(f"❌ Could not read {file}")
        continue

    json_data = []

    for _, row in df.iterrows():

        subject = str(row.get("subject", "")).strip()
        topic = str(row.get("topic", "")).strip()

        # -------------------------
        # Determine Category
        # -------------------------

        if subject in categories:

            category = subject
            subject = topic

        else:

            category = mapping.get(subject, "General")

        item = {}

        item["id"] = int(row["id"])
        item["category"] = category
        item["subject"] = subject
        item["topic"] = topic
        item["difficulty"] = row["difficulty"]
        item["question"] = row["question"]
        item["optionA"] = row["optionA"]
        item["optionB"] = row["optionB"]
        item["optionC"] = row["optionC"]
        item["optionD"] = row["optionD"]
        item["correctAnswer"] = row["correctAnswer"]
        item["answer"] = row["answer"]
        item["explanation"] = row["explanation"]
        item["companyAsked"] = row["companyAsked"]
        item["tags"] = row["tags"]
        item["source"] = row["source"]
        item["createdAt"] = row["createdAt"]

        json_data.append(item)

    output_file = file.replace(".csv", ".json")
    output_path = os.path.join(OUTPUT_FOLDER, output_file)

    with open(output_path, "w", encoding="utf-8") as f:

        json.dump(
            json_data,
            f,
            indent=4,
            ensure_ascii=False
        )

    print(f"✅ Saved {output_file}")

print("\n🎉 All datasets converted successfully!")