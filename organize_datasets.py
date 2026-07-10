import os
import json
import re

source_dir = r"w:\AWS\json"
dest_base_dir = r"w:\AWS\data"

# Ensure directories exist
os.makedirs(dest_base_dir, exist_ok=True)
for category in ["technical", "aptitude", "reasoning", "verbal"]:
    os.makedirs(os.path.join(dest_base_dir, category), exist_ok=True)

# Define dataset configuration mapping
dataset_configs = {
    "CN_Dataset.json": {
        "category": "Technical",
        "subject": "Computer Networks",
        "slug": "computer_networks",
        "dest_path": "technical/computer_networks.json"
    },
    "database_administration_interview_questions (1).json": {
        "category": "Technical",
        "subject": "DBMS",
        "slug": "dbms",
        "dest_path": "technical/dbms.json"
    },
    "DSA_dataset.json": {
        "category": "Technical",
        "subject": "Data Structures & Algorithms",
        "slug": "dsa",
        "dest_path": "technical/dsa.json"
    },
    "oops_placement_dataset.json": {
        "category": "Technical",
        "subject": "OOPs",
        "slug": "oops",
        "dest_path": "technical/oops.json"
    },
    "operating_system_OS_.json": {
        "category": "Technical",
        "subject": "Operating Systems",
        "slug": "operating_systems",
        "dest_path": "technical/operating_systems.json"
    },
    "aptitude_percentages.json": {
        "category": "Aptitude",
        "subject": "Percentages",
        "slug": "percentages",
        "dest_path": "aptitude/percentages.json"
    },
    "aptitude_profit_and_loss.json": {
        "category": "Aptitude",
        "subject": "Profit & Loss",
        "slug": "profit_and_loss",
        "dest_path": "aptitude/profit_and_loss.json"
    },
    "averages_dataset.json": {
        "category": "Aptitude",
        "subject": "Averages",
        "slug": "averages",
        "dest_path": "aptitude/averages.json"
    },
    "mixtures_alligations_dataset.json": {
        "category": "Aptitude",
        "subject": "Mixtures & Alligations",
        "slug": "mixtures_and_alligations",
        "dest_path": "aptitude/mixtures_and_alligations.json"
    },
    "permutations_combinations_dataset.json": {
        "category": "Aptitude",
        "subject": "Permutations & Combinations",
        "slug": "permutations_and_combinations",
        "dest_path": "aptitude/permutations_and_combinations.json"
    },
    "probability_dataset.json": {
        "category": "Aptitude",
        "subject": "Probability",
        "slug": "probability",
        "dest_path": "aptitude/probability.json"
    },
    "RP_Dataset.json": {
        "category": "Aptitude",
        "subject": "Ratio & Proportion",
        "slug": "ratio_and_proportion",
        "dest_path": "aptitude/ratio_and_proportion.json"
    },
    "SCI_Dataset.json": {
        "category": "Aptitude",
        "subject": "Simple & Compound Interest",
        "slug": "simple_and_compound_interest",
        "dest_path": "aptitude/simple_and_compound_interest.json"
    },
    "speed_and_distance_.json": {
        "category": "Aptitude",
        "subject": "Speed & Distance",
        "slug": "speed_and_distance",
        "dest_path": "aptitude/speed_and_distance.json"
    },
    "time_and_work_dataset_.json": {
        "category": "Aptitude",
        "subject": "Time & Work",
        "slug": "time_and_work",
        "dest_path": "aptitude/time_and_work.json"
    },
    "analogies_dataset.json": {
        "category": "Reasoning",
        "subject": "Analogies",
        "slug": "analogies",
        "dest_path": "reasoning/analogies.json"
    },
    "direction_sense_dataset.json": {
        "category": "Reasoning",
        "subject": "Direction Sense",
        "slug": "direction_sense",
        "dest_path": "reasoning/direction_sense.json"
    },
    "logical_sequence_dataset.json": {
        "category": "Reasoning",
        "subject": "Logical Sequence",
        "slug": "logical_sequence",
        "dest_path": "reasoning/logical_sequence.json"
    },
    "number_series_dataset.json": {
        "category": "Reasoning",
        "subject": "Number Series",
        "slug": "number_series",
        "dest_path": "reasoning/number_series.json"
    },
    "puzzles_dataset.json": {
        "category": "Reasoning",
        "subject": "Puzzles",
        "slug": "puzzles",
        "dest_path": "reasoning/puzzles.json"
    },
    "reasoning_blood_relations.json": {
        "category": "Reasoning",
        "subject": "Blood Relations",
        "slug": "blood_relations",
        "dest_path": "reasoning/blood_relations.json"
    },
    "reasoning_coding_decoding.json": {
        "category": "Reasoning",
        "subject": "Coding-Decoding",
        "slug": "coding_decoding",
        "dest_path": "reasoning/coding_decoding.json"
    },
    "SA_Dataset.json": {
        "category": "Reasoning",
        "subject": "Seating Arrangement",
        "slug": "seating_arrangement",
        "dest_path": "reasoning/seating_arrangement.json"
    },
    "statements_conclusions_dataset.json": {
        "category": "Reasoning",
        "subject": "Statements & Conclusions",
        "slug": "statements_and_conclusions",
        "dest_path": "reasoning/statements_and_conclusions.json"
    },
    "syllogisms_dataset.json": {
        "category": "Reasoning",
        "subject": "Syllogisms",
        "slug": "syllogisms",
        "dest_path": "reasoning/syllogisms.json"
    },
    "FITBs_dataset.json": {
        "category": "Verbal",
        "subject": "Fill in the Blanks",
        "slug": "fill_in_the_blanks",
        "dest_path": "verbal/fill_in_the_blanks.json"
    },

    "reading_comprehension_dataset.json": {
        "category": "Verbal",
        "subject": "Reading Comprehension",
        "slug": "reading_comprehension",
        "dest_path": "verbal/reading_comprehension.json"
    },
    "sentence_improvement_dataset.json": {
        "category": "Verbal",
        "subject": "Sentence Improvement",
        "slug": "sentence_improvement",
        "dest_path": "verbal/sentence_improvement.json"
    },
    "verbal_synonyms_antonyms_mcqs.json": {
        "category": "Verbal",
        "subject": "Synonyms & Antonyms",
        "slug": "synonyms_and_antonyms",
        "dest_path": "verbal/synonyms_and_antonyms.json"
    }
}

registry = {
    "categories": {
        "technical": {
            "name": "Technical",
            "icon": "code-2",
            "description": "Master core computer science subjects including Data Structures, Algorithms, DBMS, and Operating Systems for technical interviews.",
            "subjects": {}
        },
        "aptitude": {
            "name": "Aptitude",
            "icon": "calculator",
            "description": "Strengthen your quantitative aptitude skills with topics on percentages, averages, work & time, and simple & compound interest.",
            "subjects": {}
        },
        "reasoning": {
            "name": "Reasoning",
            "icon": "brain-circuit",
            "description": "Enhance your logical and analytical reasoning capabilities with puzzles, blood relations, and coding-decoding questions.",
            "subjects": {}
        },
        "verbal": {
            "name": "Verbal",
            "icon": "languages",
            "description": "Polish your verbal ability, sentence improvement, reading comprehension, and grammar rules.",
            "subjects": {}
        }
    }
}

print("Starting dataset reorganization and cleaning...")

for filename, config in dataset_configs.items():
    source_path = os.path.join(source_dir, filename)
    if not os.path.exists(source_path):
        print(f"Warning: File {filename} not found in {source_dir}. Skipping.")
        continue
    
    with open(source_path, "r", encoding="utf-8") as f:
        data = json.load(f)
    
    normalized_data = []
    
    # Track metadata for registry
    topics_set = set()
    companies_set = set()
    difficulty_dist = {"Easy": 0, "Medium": 0, "Hard": 0}
    
    category_key = config["category"].lower()
    subject_name = config["subject"]
    slug = config["slug"]
    
    for idx, item in enumerate(data):
        # Normalize fields
        difficulty = item.get("difficulty", "Medium").strip().capitalize()
        if difficulty not in ["Easy", "Medium", "Hard"]:
            difficulty = "Medium"
            
        topic = item.get("topic", "").strip()
        # Clean specific subject + topic text if it is prefix
        if topic.startswith(subject_name + " - "):
            topic = topic.replace(subject_name + " - ", "").strip()
        elif topic.startswith("Fill in the Blanks - "):
            topic = topic.replace("Fill in the Blanks - ", "").strip()
        elif topic.startswith("Logical Sequence - "):
            topic = topic.replace("Logical Sequence - ", "").strip()
        
        if not topic:
            topic = subject_name
            
        # Parse companies
        companies_str = item.get("companyAsked", "")
        if isinstance(companies_str, str):
            companies_list = [c.strip() for c in re.split(r'[;,]', companies_str) if c.strip()]
        else:
            companies_list = []
            
        # Parse tags
        tags_str = item.get("tags", "")
        if isinstance(tags_str, str):
            tags_list = [t.strip() for t in re.split(r'[;,]', tags_str) if t.strip()]
        else:
            tags_list = []
            
        # Capitalize correctAnswer letter if needed
        correct_answer = str(item.get("correctAnswer", "")).strip().upper()
        if correct_answer not in ["A", "B", "C", "D"]:
            # Attempt to deduce correctAnswer
            ans = str(item.get("answer", "")).strip()
            if ans == str(item.get("optionA", "")).strip():
                correct_answer = "A"
            elif ans == str(item.get("optionB", "")).strip():
                correct_answer = "B"
            elif ans == str(item.get("optionC", "")).strip():
                correct_answer = "C"
            elif ans == str(item.get("optionD", "")).strip():
                correct_answer = "D"
            else:
                correct_answer = "A" # Default fallback
                
        # Build normalized item
        normalized_item = {
            "id": idx + 1,  # Keep sequentially indexed starting at 1
            "category": config["category"],
            "subject": subject_name,
            "topic": topic,
            "difficulty": difficulty,
            "question": item.get("question", "").strip(),
            "optionA": item.get("optionA", "").strip(),
            "optionB": item.get("optionB", "").strip(),
            "optionC": item.get("optionC", "").strip(),
            "optionD": item.get("optionD", "").strip(),
            "correctAnswer": correct_answer,
            "answer": item.get("answer", "").strip(),
            "explanation": item.get("explanation", "").strip(),
            "companyAsked": ";".join(companies_list),
            "tags": ";".join(tags_list),
            "source": item.get("source", "Placement Hub").strip(),
            "createdAt": item.get("createdAt", "2026-07-07").strip()
        }
        
        normalized_data.append(normalized_item)
        
        # Track for stats
        topics_set.add(topic)
        for c in companies_list:
            companies_set.add(c)
        difficulty_dist[difficulty] += 1

    # Save normalized data to destination path
    dest_file_path = os.path.join(dest_base_dir, config["dest_path"])
    with open(dest_file_path, "w", encoding="utf-8") as f:
        json.dump(normalized_data, f, indent=4, ensure_ascii=False)
        
    # Add subject to registry
    registry["categories"][category_key]["subjects"][slug] = {
        "name": subject_name,
        "file": f"data/{config['dest_path']}",
        "questionCount": len(normalized_data),
        "topics": sorted(list(topics_set)),
        "companies": sorted(list(companies_set)),
        "difficultyDistribution": difficulty_dist
    }
    
    print(f"Organized: {filename} -> data/{config['dest_path']} ({len(normalized_data)} questions)")

# Write out the registry file
registry_path = os.path.join(dest_base_dir, "registry.json")
with open(registry_path, "w", encoding="utf-8") as f:
    json.dump(registry, f, indent=4, ensure_ascii=False)

print("Registry created at data/registry.json")
print("Dataset organization complete!")
