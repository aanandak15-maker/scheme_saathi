
# SCHEME SAATHI - DATASET DOCUMENTATION
## AI for Bharat Hackathon 2026

### 📁 Dataset Overview

This dataset forms the foundation for Scheme Saathi's AI-powered eligibility engine.
It combines structured rule-based logic with LLM-friendly contextual data for explainable AI decisions.

---

### 📊 FILES INCLUDED

#### 1. **schemes_database.json** (Core Scheme Data)
- **6 Major Government Schemes** with complete details
- Structured eligibility criteria (rule-based + AI context)
- Required documents mapping
- Application process flows
- Hindi translations included

**Schemes Covered:**
1. PM-KISAN - Farmer income support (₹6,000/year)
2. PMFBY - Crop insurance
3. PMAY-G - Rural housing (₹1.2-1.3 lakh)
4. PM-SYM - Unorganised worker pension (₹3,000/month after 60)
5. PM SVANidhi - Street vendor credit (up to ₹50,000)
6. PMJJBY - Life insurance (₹2 lakh cover)

#### 2. **citizen_profile_schema.json** (Profile Structure)
- Comprehensive citizen data model
- 50+ fields across 11 categories
- Field types, validation rules, required flags
- Designed for both structured rules and LLM reasoning

**Categories:**
- Personal Info (age, gender, Aadhaar, language)
- Location (state, district, rural/urban)
- Occupation (farmer, worker, vendor, etc.)
- Farmer-specific (land, crops, KCC)
- Financial (bank, income, tax status)
- Social (caste, religion)
- Family (size, dependents, disabled members)
- Housing (pucca/kutcha, ownership)
- Documents (15 types tracked)
- Exclusions (govt employee, professional, etc.)
- Digital literacy

#### 3. **citizen_profiles_test_data.json** (Sample Profiles)
- **4 Diverse Test Cases** representing different scenarios
- Real-world personas with complete profiles
- Pre-calculated eligible schemes

**Test Profiles:**
1. **Ramesh Kumar** - Marginal farmer, UP → PM-KISAN, PMFBY
2. **Sunita Devi** - BPL widow, Bihar → PMAY-G
3. **Rajesh Sharma** - Street vendor, Delhi → PM SVANidhi
4. **Manoj Yadav** - Construction worker, UP → PM-SYM, PMJJBY

#### 4. **eligibility_rules_engine.json** (Rule Logic)
- Score-based eligibility calculation
- Inclusion + Exclusion rule sets
- Priority boost rules (for PMAY-G vulnerable groups)
- Alternative scheme recommendations
- Minimum score thresholds

**Rule Types:**
- Primary requirements (must match)
- Exclusion criteria (disqualify if true)
- Special priority (boost score for vulnerable groups)
- Document requirements
- Alternative suggestions

#### 5. **documents_master.json** (Document Database)
- 15 Document types cataloged
- Issuing authority, validity, digital availability
- Maps to scheme requirements

#### 6. **CSV Files** (Quick Reference)
- schemes_summary.csv
- test_citizens_summary.csv
- documents_master.csv

---

### 🎯 HOW TO USE THIS DATASET

#### For Backend Development:
```python
import json

# Load schemes
with open('schemes_database.json') as f:
    schemes = json.load(f)

# Load citizen profile
with open('citizen_profiles_test_data.json') as f:
    citizens = json.load(f)

# Load eligibility rules
with open('eligibility_rules_engine.json') as f:
    rules = json.load(f)
```

#### For AI/LLM Integration:
1. Use `ai_context` field in schemes for semantic understanding
2. Use `ai_profile_summary` in citizen data for context
3. Combine rule-based scores with LLM reasoning for explainability

#### For Eligibility Checking:
```
1. Parse citizen profile
2. For each scheme:
   a. Calculate inclusion rule score
   b. Check exclusion rules
   c. Apply special priority boosts
   d. Compare with minimum threshold
3. Generate explainable decision
4. Suggest alternatives if rejected
```

---

### 🔄 NEXT STEPS FOR HACKATHON

**Phase 1: Database Setup**
✅ Schema design complete
✅ 6 schemes populated with real data
✅ 4 test citizen profiles created
✅ Eligibility rules defined

**Phase 2: Backend API (Next)**
- [ ] FastAPI setup with PostgreSQL
- [ ] Eligibility engine implementation
- [ ] AWS Bedrock integration for AI reasoning
- [ ] Explainability layer

**Phase 3: Voice & Language**
- [ ] AWS Transcribe integration
- [ ] Hindi/regional language support
- [ ] AWS Polly for voice responses

**Phase 4: Frontend**
- [ ] Next.js UI matching wireframes
- [ ] Voice input interface
- [ ] Eligibility result display
- [ ] CSC/VLE dashboard

---

### 📈 DATASET STATISTICS

- **Schemes**: 6 major central schemes
- **Citizen Profiles**: 4 diverse test cases
- **Eligibility Rules**: 22 inclusion + 10 exclusion rules
- **Documents**: 15 types cataloged
- **Data Fields**: 50+ per citizen profile
- **Languages**: English + Hindi (scheme names, explanations)

---

### 🚀 SCALABILITY

This dataset is designed to scale:
- Add more schemes by following the JSON structure
- Extend citizen profiles with state-specific fields
- Add regional language support
- Include state schemes alongside central schemes

---

### 🎓 DATA SOURCES

All scheme data verified from official sources (Feb 2026):
- pmkisan.gov.in
- pmfby.gov.in
- pmayg.nic.in
- maandhan.in
- pmsvanidhi.mohua.gov.in
- Official PIB releases

---

### 📝 NOTES

- Eligibility criteria current as of Feb 2026
- Test data uses masked Aadhaar/account numbers
- Hindi translations included for voice interface
- AI context fields optimize for LLM reasoning
- Rule weights allow flexible threshold tuning

---

**Built for: AI for Bharat Hackathon 2026**
**Team: Scheme Saathi**
**Dataset Version: 1.0**
**Last Updated: February 15, 2026**
