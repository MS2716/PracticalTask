# PracticalTask
## 📚 Description 

# Database Seeding Script for Plans and Eligibility System

This script is designed to **seed an SQLite database** with large-scale sample data for testing and development purposes. It populates multiple related tables with randomized entries, ensuring realistic relationships between individual plans, combo plans, and eligibility criteria.



# 🚀 Functionality Overview

1. **Data Cleanup:**
   - Clears all existing records from the following tables:  
     - `plans`  
     - `combo_plans`  
     - `combo_plan_relations`  
     - `eligibility_criteria`  
     - `plan_eligibility`  

2. **Plan Insertion:**
   - Inserts **50,000 individual plans** with randomly generated names and prices (ranging from **$10 to $1,000**).  

3. **Combo Plan Insertion:**  
   - Creates **15,000 combo plans** with randomized names and prices.  
   - Each combo plan links to **1 to 5 random individual plans** through the `combo_plan_relations` table.  

4. **Eligibility Criteria Insertion:**  
   - Adds **15,000 eligibility criteria records** with randomized rules, including:  
     - **Age Restrictions:** `age_less_than`, `age_greater_than`  
     - **Income Restrictions:** `income_less_than`, `income_greater_than`  
     - **Last Login Restrictions:** `last_login_days_ago`  

5. **Relationships:**  
   - Ensures proper linking between combo plans, individual plans, and eligibility criteria for data consistency.



# ⚙️ Technologies Used
- **Node.js**  
- **SQLite3**  



# 📊 Database Schema (Key Tables) 

- **plans:** Stores individual plan details (`id`, `name`, `price`).  
- **combo_plans:** Represents grouped plans with a bundle price (`id`, `name`, `price`).  
- **combo_plan_relations:** Links combo plans to individual plans (`combo_plan_id`, `plan_id`).  
- **eligibility_criteria:** Stores eligibility rules (`id`, `name`, `age`, `income`, etc.).  

---

# 🔑 Purpose
- Generate large-scale sample data for **performance testing**, **API testing**, and **query optimization.  
- Ensure realistic relationships between plans, combo plans, and eligibility rules.  
- Provide a robust data foundation for development and testing environments.



📥 How to Run the Script
1. Ensure Node.js and SQLite3 are installed.  
2. Place the script in your project directory.  
3. Run the script using:  
   ```bash
   node script.js
   ```
4. Verify the database (`plans.db`) for seeded data.
