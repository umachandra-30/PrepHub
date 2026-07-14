/* ==========================================================================
   Placement Preparation Hub - Career Roadmaps Script
   ========================================================================== */

// 11 Career Roadmaps data from prompt
const ROADMAPS_DATA = [
    {
        id: "frontend",
        title: "Front-End Developer",
        difficulty: "Beginner-Intermediate",
        duration: "8-10 Weeks",
        desc: "Master building engaging, responsive, and visually stunning web interfaces using modern standards and component frameworks.",
        tags: ["HTML5", "CSS3", "JavaScript", "React", "Tailwind CSS", "Build Tools"],
        colorClass: "color-frontend",
        icon: "layout",
        url: "https://career-prep-hub-roadmaps2.s3.us-east-1.amazonaws.com/frontend.pdf?response-content-disposition=inline&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEEMaCXVzLWVhc3QtMSJHMEUCIQCEcG%2BsBVw9mqUOLl01WhxJcnHWBZR5NwSsG1tFTI6H3QIgJpEFr3ZHbd9aCXZzzWOA7se3xb%2Fm6706OLDLRAuSbGEq3wMICxAAGgwxNTAyNTczNzE4NzkiDIpTrkKzZMCZN2iE0iq8Ayggr8zsh%2B%2BB4NHeanp%2BsYYx3nNlMFna0vGaX90ptPVtVfC9KZZxjwyKmd0nRwk1LXgUVnxKeaUybSAbUaAl5DvrqWc3GKO9SyXMKO%2FJ3SX0gj1m2Saeyqe%2BTpi1CiTzkmevseipxUTTcTxDT8ivTmQmc2XSthGtmhnK6k9ayhtjEADEY4ElayEbETfs5kzIVqNkOrp2vVykqmYkLcAxC4TRIw1Cyw11HcpzYZdr9Rs6YqunLnmFEwoFGlMSF22%2BuWL2rjsZy4UwKNhw1edvVsIkAKvoB6iz3wsrmbl1AgBvKI%2BWCNIIuMRqFAmQ7%2BOM4tU7f7cWGDWWnGL0JD%2FNR2BEW97qKTOr2UH6QFsuPkNfguKCSFitKvT3DH1p6HxVg5BRjOAMb6oHt3nP2FfnWLw0RJxtnKUdH7hQLQizEiCR8zF4dYmSWL%2FhmnBQ67t1q2d4PPp7sDIoo2diUW5pEdXqJ%2B%2BxKo686ZT8m1LDNSCZqR4apsqpgLH8nKDDl4uWiaSbYKZ%2BuS0xFJ49GDfBNoqKY0mR13bSCLQBYiYETsQdFw%2BVYDxK8cM7j%2BV%2Blj9%2B1YC%2BKOJZD1KhW%2Bd1uDDUttbSBjq3AniACOpw1SXPqD7KKkY0FzMDqRKzOVONfxiPsUA4%2FccUL%2BNAbczHNw25b1mzFCVpQbayDxPgxCDknTAAdyD2glsHIyCFcpPZIge43hzdq%2B1t6w2xaYHCJiGKzZfPWz644sa%2B9PorZkoiKv3ossdXi21PzYqhMoXRBi8qWACum4D71ICYV%2Bi%2B0GRapDUUpgdeM%2B32J6pPBsO2xJrIjSLQrFsZIr7krDlbDEmLGl9RjOZxZQkkBSPeWDhRjNixn%2FHTrssWMgwAUcew%2FxQDtL55wfGL50eK%2FhdHZ1frhP9meOy1xOisM4AH9hE%2FtLyDLWxeRQz5ZjlCbFrx%2FqxyYg2u2EZtm9t1mViqS6nSu3GwDym%2FduMKuS61%2BN7p99voM0T7IKbWW%2BpnPq8FWM0vSY9b%2BfCBv8nJ8oQk&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=ASIASF7AJRLT4Z6JZ744%2F20260714%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20260714T021542Z&X-Amz-Expires=43200&X-Amz-SignedHeaders=host&X-Amz-Signature=74966ea2a5525d89b272e95b01316bec4aa2e4595da21f3aa2ef220da83b49e4"
    },
    {
        id: "ai-data-scientist",
        title: "AI Data Scientist",
        difficulty: "Advanced",
        duration: "14-16 Weeks",
        desc: "Formulate business experiments, design data pipelines, and train forecasting architectures using statistics and ML.",
        tags: ["Python", "Pandas", "Scikit-Learn", "Statistics", "Data Visualization", "SQL"],
        colorClass: "color-ai",
        icon: "brain-circuit",
        url: "https://career-prep-hub-roadmaps2.s3.us-east-1.amazonaws.com/ai-data-scientist.pdf?response-content-disposition=inline&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEEMaCXVzLWVhc3QtMSJHMEUCIQCEcG%2BsBVw9mqUOLl01WhxJcnHWBZR5NwSsG1tFTI6H3QIgJpEFr3ZHbd9aCXZzzWOA7se3xb%2Fm6706OLDLRAuSbGEq3wMICxAAGgwxNTAyNTczNzE4NzkiDIpTrkKzZMCZN2iE0iq8Ayggr8zsh%2B%2BB4NHeanp%2BsYYx3nNlMFna0vGaX90ptPVtVfC9KZZxjwyKmd0nRwk1LXgUVnxKeaUybSAbUaAl5DvrqWc3GKO9SyXMKO%2FJ3SX0gj1m2Saeyqe%2BTpi1CiTzkmevseipxUTTcTxDT8ivTmQmc2XSthGtmhnK6k9ayhtjEADEY4ElayEbETfs5kzIVqNkOrp2vVykqmYkLcAxC4TRIw1Cyw11HcpzYZdr9Rs6YqunLnmFEwoFGlMSF22%2BuWL2rjsZy4UwKNhw1edvVsIkAKvoB6iz3wsrmbl1AgBvKI%2BWCNIIuMRqFAmQ7%2BOM4tU7f7cWGDWWnGL0JD%2FNR2BEW97qKTOr2UH6QFsuPkNfguKCSFitKvT3DH1p6HxVg5BRjOAMb6oHt3nP2FfnWLw0RJxtnKUdH7hQLQizEiCR8zF4dYmSWL%2FhmnBQ67t1q2d4PPp7sDIoo2diUW5pEdXqJ%2B%2BxKo686ZT8m1LDNSCZqR4apsqpgLH8nKDDl4uWiaSbYKZ%2BuS0xFJ49GDfBNoqKY0mR13bSCLQBYiYETsQdFw%2BVYDxK8cM7j%2BV%2Blj9%2B1YC%2BKOJZD1KhW%2Bd1uDDUttbSBjq3AniACOpw1SXPqD7KKkY0FzMDqRKzOVONfxiPsUA4%2FccUL%2BNAbczHNw25b1mzFCVpQbayDxPgxCDknTAAdyD2glsHIyCFcpPZIge43hzdq%2B1t6w2xaYHCJiGKzZfPWz644sa%2B9PorZkoiKv3ossdXi21PzYqhMoXRBi8qWACum4D71ICYV%2Bi%2B0GRapDUUpgdeM%2B32J6pPBsO2xJrIjSLQrFsZIr7krDlbDEmLGl9RjOZxZQkkBSPeWDhRjNixn%2FHTrssWMgwAUcew%2FxQDtL55wfGL50eK%2FhdHZ1frhP9meOy1xOisM4AH9hE%2FtLyDLWxeRQz5ZjlCbFrx%2FqxyYg2u2EZtm9t1mViqS6nSu3GwDym%2FduMKuS61%2BN7p99voM0T7IKbWW%2BpnPq8FWM0vSY9b%2BfCBv8nJ8oQk&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=ASIASF7AJRLT4Z6JZ744%2F20260714%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20260714T021714Z&X-Amz-Expires=43200&X-Amz-SignedHeaders=host&X-Amz-Signature=381371f5a08ec2b8490f844443a33e4331dbf5dfd6c7c0d7cd15d71bd4bad76d"
    },
    {
        id: "ai-engineer",
        title: "AI Engineer",
        difficulty: "Advanced",
        duration: "12-14 Weeks",
        desc: "Deploy large language models (LLMs), build production agents, implement vector stores, and optimize inference layers.",
        tags: ["PyTorch", "LLMs", "LangChain", "Vector DBs", "Prompting", "APIs"],
        colorClass: "color-ai",
        icon: "cpu",
        url: "https://career-prep-hub-roadmaps2.s3.us-east-1.amazonaws.com/ai-engineer.pdf?response-content-disposition=inline&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEEMaCXVzLWVhc3QtMSJHMEUCIQCEcG%2BsBVw9mqUOLl01WhxJcnHWBZR5NwSsG1tFTI6H3QIgJpEFr3ZHbd9aCXZzzWOA7se3xb%2Fm6706OLDLRAuSbGEq3wMICxAAGgwxNTAyNTczNzE4NzkiDIpTrkKzZMCZN2iE0iq8Ayggr8zsh%2B%2BB4NHeanp%2BsYYx3nNlMFna0vGaX90ptPVtVfC9KZZxjwyKmd0nRwk1LXgUVnxKeaUybSAbUaAl5DvrqWc3GKO9SyXMKO%2FJ3SX0gj1m2Saeyqe%2BTpi1CiTzkmevseipxUTTcTxDT8ivTmQmc2XSthGtmhnK6k9ayhtjEADEY4ElayEbETfs5kzIVqNkOrp2vVykqmYkLcAxC4TRIw1Cyw11HcpzYZdr9Rs6YqunLnmFEwoFGlMSF22%2BuWL2rjsZy4UwKNhw1edvVsIkAKvoB6iz3wsrmbl1AgBvKI%2BWCNIIuMRqFAmQ7%2BOM4tU7f7cWGDWWnGL0JD%2FNR2BEW97qKTOr2UH6QFsuPkNfguKCSFitKvT3DH1p6HxVg5BRjOAMb6oHt3nP2FfnWLw0RJxtnKUdH7hQLQizEiCR8zF4dYmSWL%2FhmnBQ67t1q2d4PPp7sDIoo2diUW5pEdXqJ%2B%2BxKo686ZT8m1LDNSCZqR4apsqpgLH8nKDDl4uWiaSbYKZ%2BuS0xFJ49GDfBNoqKY0mR13bSCLQBYiYETsQdFw%2BVYDxK8cM7j%2BV%2Blj9%2B1YC%2BKOJZD1KhW%2Bd1uDDUttbSBjq3AniACOpw1SXPqD7KKkY0FzMDqRKzOVONfxiPsUA4%2FccUL%2BNAbczHNw25b1mzFCVpQbayDxPgxCDknTAAdyD2glsHIyCFcpPZIge43hzdq%2B1t6w2xaYHCJiGKzZfPWz644sa%2B9PorZkoiKv3ossdXi21PzYqhMoXRBi8qWACum4D71ICYV%2Bi%2B0GRapDUUpgdeM%2B32J6pPBsO2xJrIjSLQrFsZIr7krDlbDEmLGl9RjOZxZQkkBSPeWDhRjNixn%2FHTrssWMgwAUcew%2FxQDtL55wfGL50eK%2FhdHZ1frhP9meOy1xOisM4AH9hE%2FtLyDLWxeRQz5ZjlCbFrx%2FqxyYg2u2EZtm9t1mViqS6nSu3GwDym%2FduMKuS61%2BN7p99voM0T7IKbWW%2BpnPq8FWM0vSY9b%2BfCBv8nJ8oQk&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=ASIASF7AJRLT4Z6JZ744%2F20260714%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20260714T021810Z&X-Amz-Expires=43200&X-Amz-SignedHeaders=host&X-Amz-Signature=4fbc330eb116ffdfc5427c70ad701652fb4060ee31e8392ac1a5396d23810282"
    },
    {
        id: "backend",
        title: "Backend Developer",
        difficulty: "Intermediate-Advanced",
        duration: "10-12 Weeks",
        desc: "Design high-concurrency API structures, handle database queries, optimize caching layers, and scale architecture modules.",
        tags: ["Node.js", "Express", "Python", "SQL", "Redis", "REST APIs", "Docker"],
        colorClass: "color-backend",
        icon: "server",
        url: "https://career-prep-hub-roadmaps2.s3.us-east-1.amazonaws.com/backend.pdf?response-content-disposition=inline&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEEMaCXVzLWVhc3QtMSJHMEUCIQCEcG%2BsBVw9mqUOLl01WhxJcnHWBZR5NwSsG1tFTI6H3QIgJpEFr3ZHbd9aCXZzzWOA7se3xb%2Fm6706OLDLRAuSbGEq3wMICxAAGgwxNTAyNTczNzE4NzkiDIpTrkKzZMCZN2iE0iq8Ayggr8zsh%2B%2BB4NHeanp%2BsYYx3nNlMFna0vGaX90ptPVtVfC9KZZxjwyKmd0nRwk1LXgUVnxKeaUybSAbUaAl5DvrqWc3GKO9SyXMKO%2FJ3SX0gj1m2Saeyqe%2BTpi1CiTzkmevseipxUTTcTxDT8ivTmQmc2XSthGtmhnK6k9ayhtjEADEY4ElayEbETfs5kzIVqNkOrp2vVykqmYkLcAxC4TRIw1Cyw11HcpzYZdr9Rs6YqunLnmFEwoFGlMSF22%2BuWL2rjsZy4UwKNhw1edvVsIkAKvoB6iz3wsrmbl1AgBvKI%2BWCNIIuMRqFAmQ7%2BOM4tU7f7cWGDWWnGL0JD%2FNR2BEW97qKTOr2UH6QFsuPkNfguKCSFitKvT3DH1p6HxVg5BRjOAMb6oHt3nP2FfnWLw0RJxtnKUdH7hQLQizEiCR8zF4dYmSWL%2FhmnBQ67t1q2d4PPp7sDIoo2diUW5pEdXqJ%2B%2BxKo686ZT8m1LDNSCZqR4apsqpgLH8nKDDl4uWiaSbYKZ%2BuS0xFJ49GDfBNoqKY0mR13bSCLQBYiYETsQdFw%2BVYDxK8cM7j%2BV%2Blj9%2B1YC%2BKOJZD1KhW%2Bd1uDDUttbSBjq3AniACOpw1SXPqD7KKkY0FzMDqRKzOVONfxiPsUA4%2FccUL%2BNAbczHNw25b1mzFCVpQbayDxPgxCDknTAAdyD2glsHIyCFcpPZIge43hzdq%2B1t6w2xaYHCJiGKzZfPWz644sa%2B9PorZkoiKv3ossdXi21PzYqhMoXRBi8qWACum4D71ICYV%2Bi%2B0GRapDUUpgdeM%2B32J6pPBsO2xJrIjSLQrFsZIr7krDlbDEmLGl9RjOZxZQkkBSPeWDhRjNixn%2FHTrssWMgwAUcew%2FxQDtL55wfGL50eK%2FhdHZ1frhP9meOy1xOisM4AH9hE%2FtLyDLWxeRQz5ZjlCbFrx%2FqxyYg2u2EZtm9t1mViqS6nSu3GwDym%2FduMKuS61%2BN7p99voM0T7IKbWW%2BpnPq8FWM0vSY9b%2BfCBv8nJ8oQk&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=ASIASF7AJRLT4Z6JZ744%2F20260714%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20260714T021837Z&X-Amz-Expires=43200&X-Amz-SignedHeaders=host&X-Amz-Signature=77c5047e8602f114a012f4bbac5893d6deb50466bdf02a5faaf2c89281d07ab8"
    },
    {
        id: "data-analyst",
        title: "Data Analyst",
        difficulty: "Beginner-Intermediate",
        duration: "6-8 Weeks",
        desc: "Inspect, filter, clean, and represent business intelligence findings using structured queries and dashboards.",
        tags: ["SQL", "Excel", "Tableau", "Power BI", "Data Cleaning", "Descriptive Stats"],
        colorClass: "color-data",
        icon: "bar-chart-3",
        url: "https://career-prep-hub-roadmaps2.s3.us-east-1.amazonaws.com/data-analyst.pdf?response-content-disposition=inline&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEEMaCXVzLWVhc3QtMSJHMEUCIQCEcG%2BsBVw9mqUOLl01WhxJcnHWBZR5NwSsG1tFTI6H3QIgJpEFr3ZHbd9aCXZzzWOA7se3xb%2Fm6706OLDLRAuSbGEq3wMICxAAGgwxNTAyNTczNzE4NzkiDIpTrkKzZMCZN2iE0iq8Ayggr8zsh%2B%2BB4NHeanp%2BsYYx3nNlMFna0vGaX90ptPVtVfC9KZZxjwyKmd0nRwk1LXgUVnxKeaUybSAbUaAl5DvrqWc3GKO9SyXMKO%2FJ3SX0gj1m2Saeyqe%2BTpi1CiTzkmevseipxUTTcTxDT8ivTmQmc2XSthGtmhnK6k9ayhtjEADEY4ElayEbETfs5kzIVqNkOrp2vVykqmYkLcAxC4TRIw1Cyw11HcpzYZdr9Rs6YqunLnmFEwoFGlMSF22%2BuWL2rjsZy4UwKNhw1edvVsIkAKvoB6iz3wsrmbl1AgBvKI%2BWCNIIuMRqFAmQ7%2BOM4tU7f7cWGDWWnGL0JD%2FNR2BEW97qKTOr2UH6QFsuPkNfguKCSFitKvT3DH1p6HxVg5BRjOAMb6oHt3nP2FfnWLw0RJxtnKUdH7hQLQizEiCR8zF4dYmSWL%2FhmnBQ67t1q2d4PPp7sDIoo2diUW5pEdXqJ%2B%2BxKo686ZT8m1LDNSCZqR4apsqpgLH8nKDDl4uWiaSbYKZ%2BuS0xFJ49GDfBNoqKY0mR13bSCLQBYiYETsQdFw%2BVYDxK8cM7j%2BV%2Blj9%2B1YC%2BKOJZD1KhW%2Bd1uDDUttbSBjq3AniACOpw1SXPqD7KKkY0FzMDqRKzOVONfxiPsUA4%2FccUL%2BNAbczHNw25b1mzFCVpQbayDxPgxCDknTAAdyD2glsHIyCFcpPZIge43hzdq%2B1t6w2xaYHCJiGKzZfPWz644sa%2B9PorZkoiKv3ossdXi21PzYqhMoXRBi8qWACum4D71ICYV%2Bi%2B0GRapDUUpgdeM%2B32J6pPBsO2xJrIjSLQrFsZIr7krDlbDEmLGl9RjOZxZQkkBSPeWDhRjNixn%2FHTrssWMgwAUcew%2FxQDtL55wfGL50eK%2FhdHZ1frhP9meOy1xOisM4AH9hE%2FtLyDLWxeRQz5ZjlCbFrx%2FqxyYg2u2EZtm9t1mViqS6nSu3GwDym%2FduMKuS61%2BN7p99voM0T7IKbWW%2BpnPq8FWM0vSY9b%2BfCBv8nJ8oQk&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=ASIASF7AJRLT4Z6JZ744%2F20260714%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20260714T021905Z&X-Amz-Expires=43200&X-Amz-SignedHeaders=host&X-Amz-Signature=b6c80786f228761ba8eb396e5121576c0cae7d388e35bcb2cb26654b9a60cc4a"
    },
    {
        id: "data-engineer",
        title: "Data Engineer",
        difficulty: "Intermediate-Advanced",
        duration: "12-14 Weeks",
        desc: "Construct robust, automated data pipelines, scale storage schemas, design warehouses, and handle big data architecture.",
        tags: ["Hadoop", "Spark", "Kafka", "Airflow", "ETL Pipelines", "Snowflake"],
        colorClass: "color-data",
        icon: "database",
        url: "https://career-prep-hub-roadmaps2.s3.us-east-1.amazonaws.com/data-engineer.pdf?response-content-disposition=inline&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEEMaCXVzLWVhc3QtMSJHMEUCIQCEcG%2BsBVw9mqUOLl01WhxJcnHWBZR5NwSsG1tFTI6H3QIgJpEFr3ZHbd9aCXZzzWOA7se3xb%2Fm6706OLDLRAuSbGEq3wMICxAAGgwxNTAyNTczNzE4NzkiDIpTrkKzZMCZN2iE0iq8Ayggr8zsh%2B%2BB4NHeanp%2BsYYx3nNlMFna0vGaX90ptPVtVfC9KZZxjwyKmd0nRwk1LXgUVnxKeaUybSAbUaAl5DvrqWc3GKO9SyXMKO%2FJ3SX0gj1m2Saeyqe%2BTpi1CiTzkmevseipxUTTcTxDT8ivTmQmc2XSthGtmhnK6k9ayhtjEADEY4ElayEbETfs5kzIVqNkOrp2vVykqmYkLcAxC4TRIw1Cyw11HcpzYZdr9Rs6YqunLnmFEwoFGlMSF22%2BuWL2rjsZy4UwKNhw1edvVsIkAKvoB6iz3wsrmbl1AgBvKI%2BWCNIIuMRqFAmQ7%2BOM4tU7f7cWGDWWnGL0JD%2FNR2BEW97qKTOr2UH6QFsuPkNfguKCSFitKvT3DH1p6HxVg5BRjOAMb6oHt3nP2FfnWLw0RJxtnKUdH7hQLQizEiCR8zF4dYmSWL%2FhmnBQ67t1q2d4PPp7sDIoo2diUW5pEdXqJ%2B%2BxKo686ZT8m1LDNSCZqR4apsqpgLH8nKDDl4uWiaSbYKZ%2BuS0xFJ49GDfBNoqKY0mR13bSCLQBYiYETsQdFw%2BVYDxK8cM7j%2BV%2Blj9%2B1YC%2BKOJZD1KhW%2Bd1uDDUttbSBjq3AniACOpw1SXPqD7KKkY0FzMDqRKzOVONfxiPsUA4%2FccUL%2BNAbczHNw25b1mzFCVpQbayDxPgxCDknTAAdyD2glsHIyCFcpPZIge43hzdq%2B1t6w2xaYHCJiGKzZfPWz644sa%2B9PorZkoiKv3ossdXi21PzYqhMoXRBi8qWACum4D71ICYV%2Bi%2B0GRapDUUpgdeM%2B32J6pPBsO2xJrIjSLQrFsZIr7krDlbDEmLGl9RjOZxZQkkBSPeWDhRjNixn%2FHTrssWMgwAUcew%2FxQDtL55wfGL50eK%2FhdHZ1frhP9meOy1xOisM4AH9hE%2FtLyDLWxeRQz5ZjlCbFrx%2FqxyYg2u2EZtm9t1mViqS6nSu3GwDym%2FduMKuS61%2BN7p99voM0T7IKbWW%2BpnPq8FWM0vSY9b%2BfCBv8nJ8oQk&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=ASIASF7AJRLT4Z6JZ744%2F20260714%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20260714T021935Z&X-Amz-Expires=43200&X-Amz-SignedHeaders=host&X-Amz-Signature=d21b2b9ed1b916b272ff2f73c1d27cd03423d7262d646a036f1167bc15954c51"
    },
    {
        id: "devops",
        title: "DevOps Engineer",
        difficulty: "Intermediate-Advanced",
        duration: "10-12 Weeks",
        desc: "Automate delivery chains, orchestrate container instances, configure virtual clouds, and handle cluster monitoring.",
        tags: ["Docker", "Kubernetes", "CI/CD", "AWS", "Terraform", "Linux Bash"],
        colorClass: "color-devops",
        icon: "infinity",
        url: "https://career-prep-hub-roadmaps2.s3.us-east-1.amazonaws.com/devops.pdf?response-content-disposition=inline&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEEMaCXVzLWVhc3QtMSJHMEUCIQCEcG%2BsBVw9mqUOLl01WhxJcnHWBZR5NwSsG1tFTI6H3QIgJpEFr3ZHbd9aCXZzzWOA7se3xb%2Fm6706OLDLRAuSbGEq3wMICxAAGgwxNTAyNTczNzE4NzkiDIpTrkKzZMCZN2iE0iq8Ayggr8zsh%2B%2BB4NHeanp%2BsYYx3nNlMFna0vGaX90ptPVtVfC9KZZxjwyKmd0nRwk1LXgUVnxKeaUybSAbUaAl5DvrqWc3GKO9SyXMKO%2FJ3SX0gj1m2Saeyqe%2BTpi1CiTzkmevseipxUTTcTxDT8ivTmQmc2XSthGtmhnK6k9ayhtjEADEY4ElayEbETfs5kzIVqNkOrp2vVykqmYkLcAxC4TRIw1Cyw11HcpzYZdr9Rs6YqunLnmFEwoFGlMSF22%2BuWL2rjsZy4UwKNhw1edvVsIkAKvoB6iz3wsrmbl1AgBvKI%2BWCNIIuMRqFAmQ7%2BOM4tU7f7cWGDWWnGL0JD%2FNR2BEW97qKTOr2UH6QFsuPkNfguKCSFitKvT3DH1p6HxVg5BRjOAMb6oHt3nP2FfnWLw0RJxtnKUdH7hQLQizEiCR8zF4dYmSWL%2FhmnBQ67t1q2d4PPp7sDIoo2diUW5pEdXqJ%2B%2BxKo686ZT8m1LDNSCZqR4apsqpgLH8nKDDl4uWiaSbYKZ%2BuS0xFJ49GDfBNoqKY0mR13bSCLQBYiYETsQdFw%2BVYDxK8cM7j%2BV%2Blj9%2B1YC%2BKOJZD1KhW%2Bd1uDDUttbSBjq3AniACOpw1SXPqD7KKkY0FzMDqRKzOVONfxiPsUA4%2FccUL%2BNAbczHNw25b1mzFCVpQbayDxPgxCDknTAAdyD2glsHIyCFcpPZIge43hzdq%2B1t6w2xaYHCJiGKzZfPWz644sa%2B9PorZkoiKv3ossdXi21PzYqhMoXRBi8qWACum4D71ICYV%2Bi%2B0GRapDUUpgdeM%2B32J6pPBsO2xJrIjSLQrFsZIr7krDlbDEmLGl9RjOZxZQkkBSPeWDhRjNixn%2FHTrssWMgwAUcew%2FxQDtL55wfGL50eK%2FhdHZ1frhP9meOy1xOisM4AH9hE%2FtLyDLWxeRQz5ZjlCbFrx%2FqxyYg2u2EZtm9t1mViqS6nSu3GwDym%2FduMKuS61%2BN7p99voM0T7IKbWW%2BpnPq8FWM0vSY9b%2BfCBv8nJ8oQk&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=ASIASF7AJRLT4Z6JZ744%2F20260714%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20260714T022027Z&X-Amz-Expires=43200&X-Amz-SignedHeaders=host&X-Amz-Signature=48bfc6a68b44635dd87add58463fbee24f545f017a916b919d5c8b4e7d6088d4"
    },
    {
        id: "full-stack",
        title: "Full-Stack Developer",
        difficulty: "Intermediate-Advanced",
        duration: "12-16 Weeks",
        desc: "Construct complete, functional applications by integrating rich responsive clients with scalable database backends.",
        tags: ["React", "Node.js", "Express", "SQL & NoSQL", "Web Security", "Cloud Deploy"],
        colorClass: "color-fullstack",
        icon: "layers",
        url: "https://career-prep-hub-roadmaps2.s3.us-east-1.amazonaws.com/full-stack.pdf?response-content-disposition=inline&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEEMaCXVzLWVhc3QtMSJIMEYCIQD7gHQxpeMQcrgRJrUFkC1Y1CDHz9fxjf8uQ9SoHeI2agIhAOygLY1o%2BWO8hoy06vM2UtDShnq7mbi6hou%2FcSGZUgdTKt8DCAsQABoMMTUwMjU3MzcxODc5IgxsAROUJ3ScFDrg2CAqvAObgYFrswFc9CD1CmUE%2FnwwtS3R%2Fc2R0G%2FVk2yapEEqw4t%2BtNO6AphrnNsV35mQV4v8tKXfwhiF1iYylZ6jHtgOw2bTv%2BfwVWc7IiRB9zpVOTRjctKwIYllZSTYr3OUoJVNN4C7LlfV53itW6RQOJJZKekCr6c0kpAEJp4EhlTG%2Bq%2F3W7h3x0UF5wuE%2BcyKYdnA9xTXVGeJmFs9lHW4EYZLQGdtjrQVqEw2XDISM0T5MPjhozIwOFbHgISoAnlP8WtFed9v2AUDcf05wVtMa%2BBuOA3MxLFmMAXiMVIN5rvi4Dox00h5ZayWW3Fnphe0jEfCTw%2BNWSh4iUKtOXW9fnaeeiXXPOxKSpTUOAffCavvPOCsazrQLwME0NFFhfKGTCfLXkF97bD%2Femf5MqpuWUrbKriEiXnor4mU1J0xCDu%2FpC0f9hHrGtGQthlz0w8WK%2BMCmCBpxzRVDVWJqXzdcpxZ8Dt8KvOgq2ygRrQGFBPTMGNTA93zCwNDaFKM4XZb5F%2Bqqqh%2FA3M9P51XfP89bqtkciS4wp4xueX5cpXn3v3GmsLbOE9jVDwPj1%2BUf6qK%2FWdBWTvtEMg98F1DQnsw1LbW0gY6tgIdlJYbr5Nbs8g48jJ%2FPBAt8GO4igjRdQJLGjVRKhkoOyyn6WAOIQdyNy1N665M%2B90yebLJtltn9%2F4tfEwWotiar5gLeXs6Uv2Ty7pOZ83DIn%2BN985r%2B13wT02Fj7JSN1TzviVOlrniRYeWY1J9bqh%2B2ND6iIpfL22C%2FgF%2FWVmapN8kX3NP15yh0doJElw9WweguLG0JdI60Hfa%2FtH01FjXAXNomk8zLS8%2BWsYknc1SJzfBkfPy05Ysk0%2B2m%2F6WVAQj9%2Ffx2tzrDPNyTi9Np8iBsU%2Fd%2BmP4VEq7I%2Bxg1Ojn40qU%2BNdW4ogkDM07A9TlY5ZI6eZBpWnWsCytod63JDvQyrSIX80LyTY12HgymF%2FLS21DU4HAR9MSNSgnzPoqRTiXqizI0ByKWsqWRnisqmLeY%2Bl01NWg&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=ASIASF7AJRLT7TN6IRYL%2F20260714%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20260714T022130Z&X-Amz-Expires=43200&X-Amz-SignedHeaders=host&X-Amz-Signature=6a202c356332d886186f00577ed46dd9613aec31e6bc6321ca61c58854b34734"
    },
    {
        id: "game-developer",
        title: "Game Developer",
        difficulty: "Intermediate-Advanced",
        duration: "12-14 Weeks",
        desc: "Design interactive digital environments, script gameplay mechanics, learn shading concepts, and program engine modules.",
        tags: ["C++", "C#", "Unity", "Unreal Engine", "3D Math", "Physics Engines"],
        colorClass: "color-game",
        icon: "gamepad-2",
        url: "https://career-prep-hub-roadmaps2.s3.us-east-1.amazonaws.com/game-developer.pdf?response-content-disposition=inline&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEEMaCXVzLWVhc3QtMSJIMEYCIQD7gHQxpeMQcrgRJrUFkC1Y1CDHz9fxjf8uQ9SoHeI2agIhAOygLY1o%2BWO8hoy06vM2UtDShnq7mbi6hou%2FcSGZUgdTKt8DCAsQABoMMTUwMjU3MzcxODc5IgxsAROUJ3ScFDrg2CAqvAObgYFrswFc9CD1CmUE%2FnwwtS3R%2Fc2R0G%2FVk2yapEEqw4t%2BtNO6AphrnNsV35mQV4v8tKXfwhiF1iYylZ6jHtgOw2bTv%2BfwVWc7IiRB9zpVOTRjctKwIYllZSTYr3OUoJVNN4C7LlfV53itW6RQOJJZKekCr6c0kpAEJp4EhlTG%2Bq%2F3W7h3x0UF5wuE%2BcyKYdnA9xTXVGeJmFs9lHW4EYZLQGdtjrQVqEw2XDISM0T5MPjhozIwOFbHgISoAnlP8WtFed9v2AUDcf05wVtMa%2BBuOA3MxLFmMAXiMVIN5rvi4Dox00h5ZayWW3Fnphe0jEfCTw%2BNWSh4iUKtOXW9fnaeeiXXPOxKSpTUOAffCavvPOCsazrQLwME0NFFhfKGTCfLXkF97bD%2Femf5MqpuWUrbKriEiXnor4mU1J0xCDu%2FpC0f9hHrGtGQthlz0w8WK%2BMCmCBpxzRVDVWJqXzdcpxZ8Dt8KvOgq2ygRrQGFBPTMGNTA93zCwNDaFKM4XZb5F%2Bqqqh%2FA3M9P51XfP89bqtkciS4wp4xueX5cpXn3v3GmsLbOE9jVDwPj1%2BUf6qK%2FWdBWTvtEMg98F1DQnsw1LbW0gY6tgIdlJYbr5Nbs8g48jJ%2FPBAt8GO4igjRdQJLGjVRKhkoOyyn6WAOIQdyNy1N665M%2B90yebLJtltn9%2F4tfEwWotiar5gLeXs6Uv2Ty7pOZ83DIn%2BN985r%2B13wT02Fj7JSN1TzviVOlrniRYeWY1J9bqh%2B2ND6iIpfL22C%2FgF%2FWVmapN8kX3NP15yh0doJElw9WweguLG0JdI60Hfa%2FtH01FjXAXNomk8zLS8%2BWsYknc1SJzfBkfPy05Ysk0%2B2m%2F6WVAQj9%2Ffx2tzrDPNyTi9Np8iBsU%2Fd%2BmP4VEq7I%2Bxg1Ojn40qU%2BNdW4ogkDM07A9TlY5ZI6eZBpWnWsCytod63JDvQyrSIX80LyTY12HgymF%2FLS21DU4HAR9MSNSgnzPoqRTiXqizI0ByKWsqWRnisqmLeY%2Bl01NWg&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=ASIASF7AJRLT7TN6IRYL%2F20260714%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20260714T022236Z&X-Amz-Expires=43200&X-Amz-SignedHeaders=host&X-Amz-Signature=0e68a83edbe045d5c08b2adadf1cd62d9fed07ee4e889cf3897faf05d7baa0c0"
    },
    {
        id: "ios",
        title: "iOS Developer",
        difficulty: "Intermediate",
        duration: "8-10 Weeks",
        desc: "Design native mobile environments for Apple devices using Swift, SwiftUI layouts, and localized storage logic.",
        tags: ["Swift", "SwiftUI", "Xcode", "UIKit", "Core Data", "App Store Guidelines"],
        colorClass: "color-mobile",
        icon: "smartphone",
        url: "https://career-prep-hub-roadmaps2.s3.us-east-1.amazonaws.com/ios.pdf?response-content-disposition=inline&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEEMaCXVzLWVhc3QtMSJIMEYCIQD7gHQxpeMQcrgRJrUFkC1Y1CDHz9fxjf8uQ9SoHeI2agIhAOygLY1o%2BWO8hoy06vM2UtDShnq7mbi6hou%2FcSGZUgdTKt8DCAsQABoMMTUwMjU3MzcxODc5IgxsAROUJ3ScFDrg2CAqvAObgYFrswFc9CD1CmUE%2FnwwtS3R%2Fc2R0G%2FVk2yapEEqw4t%2BtNO6AphrnNsV35mQV4v8tKXfwhiF1iYylZ6jHtgOw2bTv%2BfwVWc7IiRB9zpVOTRjctKwIYllZSTYr3OUoJVNN4C7LlfV53itW6RQOJJZKekCr6c0kpAEJp4EhlTG%2Bq%2F3W7h3x0UF5wuE%2BcyKYdnA9xTXVGeJmFs9lHW4EYZLQGdtjrQVqEw2XDISM0T5MPjhozIwOFbHgISoAnlP8WtFed9v2AUDcf05wVtMa%2BBuOA3MxLFmMAXiMVIN5rvi4Dox00h5ZayWW3Fnphe0jEfCTw%2BNWSh4iUKtOXW9fnaeeiXXPOxKSpTUOAffCavvPOCsazrQLwME0NFFhfKGTCfLXkF97bD%2Femf5MqpuWUrbKriEiXnor4mU1J0xCDu%2FpC0f9hHrGtGQthlz0w8WK%2BMCmCBpxzRVDVWJqXzdcpxZ8Dt8KvOgq2ygRrQGFBPTMGNTA93zCwNDaFKM4XZb5F%2Bqqqh%2FA3M9P51XfP89bqtkciS4wp4xueX5cpXn3v3GmsLbOE9jVDwPj1%2BUf6qK%2FWdBWTvtEMg98F1DQnsw1LbW0gY6tgIdlJYbr5Nbs8g48jJ%2FPBAt8GO4igjRdQJLGjVRKhkoOyyn6WAOIQdyNy1N665M%2B90yebLJtltn9%2F4tfEwWotiar5gLeXs6Uv2Ty7pOZ83DIn%2BN985r%2B13wT02Fj7JSN1TzviVOlrniRYeWY1J9bqh%2B2ND6iIpfL22C%2FgF%2FWVmapN8kX3NP15yh0doJElw9WweguLG0JdI60Hfa%2FtH01FjXAXNomk8zLS8%2BWsYknc1SJzfBkfPy05Ysk0%2B2m%2F6WVAQj9%2Ffx2tzrDPNyTi9Np8iBsU%2Fd%2BmP4VEq7I%2Bxg1Ojn40qU%2BNdW4ogkDM07A9TlY5ZI6eZBpWnWsCytod63JDvQyrSIX80LyTY12HgymF%2FLS21DU4HAR9MSNSgnzPoqRTiXqizI0ByKWsqWRnisqmLeY%2Bl01NWg&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=ASIASF7AJRLT7TN6IRYL%2F20260714%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20260714T022303Z&X-Amz-Expires=43200&X-Amz-SignedHeaders=host&X-Amz-Signature=007d66fb62f55349864e5be83d44408c8ebd39bef9b8af0cc21ff8669f364573"
    },
    {
        id: "machine-learning",
        title: "Machine Learning Engineer",
        difficulty: "Advanced",
        duration: "14-16 Weeks",
        desc: "Tune deep neural layers, construct model pipelines, validate feature choices, and orchestrate model packaging structures.",
        tags: ["Python", "PyTorch", "MLOps", "Model Tuning", "Probability", "Algorithms"],
        colorClass: "color-ai",
        icon: "brain",
        url: "https://career-prep-hub-roadmaps2.s3.us-east-1.amazonaws.com/machine-learning.pdf?response-content-disposition=inline&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEEMaCXVzLWVhc3QtMSJIMEYCIQD7gHQxpeMQcrgRJrUFkC1Y1CDHz9fxjf8uQ9SoHeI2agIhAOygLY1o%2BWO8hoy06vM2UtDShnq7mbi6hou%2FcSGZUgdTKt8DCAsQABoMMTUwMjU3MzcxODc5IgxsAROUJ3ScFDrg2CAqvAObgYFrswFc9CD1CmUE%2FnwwtS3R%2Fc2R0G%2FVk2yapEEqw4t%2BtNO6AphrnNsV35mQV4v8tKXfwhiF1iYylZ6jHtgOw2bTv%2BfwVWc7IiRB9zpVOTRjctKwIYllZSTYr3OUoJVNN4C7LlfV53itW6RQOJJZKekCr6c0kpAEJp4EhlTG%2Bq%2F3W7h3x0UF5wuE%2BcyKYdnA9xTXVGeJmFs9lHW4EYZLQGdtjrQVqEw2XDISM0T5MPjhozIwOFbHgISoAnlP8WtFed9v2AUDcf05wVtMa%2BBuOA3MxLFmMAXiMVIN5rvi4Dox00h5ZayWW3Fnphe0jEfCTw%2BNWSh4iUKtOXW9fnaeeiXXPOxKSpTUOAffCavvPOCsazrQLwME0NFFhfKGTCfLXkF97bD%2Femf5MqpuWUrbKriEiXnor4mU1J0xCDu%2FpC0f9hHrGtGQthlz0w8WK%2BMCmCBpxzRVDVWJqXzdcpxZ8Dt8KvOgq2ygRrQGFBPTMGNTA93zCwNDaFKM4XZb5F%2Bqqqh%2FA3M9P51XfP89bqtkciS4wp4xueX5cpXn3v3GmsLbOE9jVDwPj1%2BUf6qK%2FWdBWTvtEMg98F1DQnsw1LbW0gY6tgIdlJYbr5Nbs8g48jJ%2FPBAt8GO4igjRdQJLGjVRKhkoOyyn6WAOIQdyNy1N665M%2B90yebLJtltn9%2F4tfEwWotiar5gLeXs6Uv2Ty7pOZ83DIn%2BN985r%2B13wT02Fj7JSN1TzviVOlrniRYeWY1J9bqh%2B2ND6iIpfL22C%2FgF%2FWVmapN8kX3NP15yh0doJElw9WweguLG0JdI60Hfa%2FtH01FjXAXNomk8zLS8%2BWsYknc1SJzfBkfPy05Ysk0%2B2m%2F6WVAQj9%2Ffx2tzrDPNyTi9Np8iBsU%2Fd%2BmP4VEq7I%2Bxg1Ojn40qU%2BNdW4ogkDM07A9TlY5ZI6eZBpWnWsCytod63JDvQyrSIX80LyTY12HgymF%2FLS21DU4HAR9MSNSgnzPoqRTiXqizI0ByKWsqWRnisqmLeY%2Bl01NWg&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=ASIASF7AJRLT7TN6IRYL%2F20260714%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20260714T022359Z&X-Amz-Expires=43200&X-Amz-SignedHeaders=host&X-Amz-Signature=919294bdbd7c3085d04aa5ad2d6414f3097f515c94e33de0338ba74dd92e6313"
    }
];

document.addEventListener('DOMContentLoaded', () => {
    const isAuthorized = window.isLoggedIn && window.isLoggedIn();
    const authorizedView = document.getElementById('authorized-view');
    const unauthorizedView = document.getElementById('unauthorized-view');

    if (isAuthorized) {
        if (authorizedView) authorizedView.classList.remove('hidden');
        if (unauthorizedView) unauthorizedView.classList.add('hidden');
        
        // Initial render
        renderRoadmaps(ROADMAPS_DATA);
        
        // Setup Search and Filters
        setupFilters();
    } else {
        if (unauthorizedView) unauthorizedView.classList.remove('hidden');
        if (authorizedView) authorizedView.classList.add('hidden');
    }
});

/**
 * Render roadmap cards into the DOM grid
 * @param {Array} roadmaps List of roadmaps to display
 */
function renderRoadmaps(roadmaps) {
    const container = document.getElementById('roadmaps-container');
    if (!container) return;

    if (roadmaps.length === 0) {
        container.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 4rem 1rem; color: var(--text-secondary); background: var(--bg-secondary); border-radius: var(--border-radius-lg); border: 1px solid var(--border-color);">
                <i class="lucide-compass" style="font-size: 3rem; color: var(--text-secondary); margin-bottom: 1rem; display: inline-block;"></i>
                <h3 style="font-size: 1.4rem; margin-bottom: 0.5rem; color: var(--text-primary);">No Matching Pathways</h3>
                <p style="font-size: 0.95rem;">We couldn't find any career roadmaps matching your filter query. Try searching for a different role or tag.</p>
            </div>
        `;
        if (typeof lucide !== 'undefined') lucide.createIcons();
        return;
    }

    let html = '';
    roadmaps.forEach(r => {
        // Map difficulty level to badges
        let difficultyBadgeClass = 'badge-medium';
        if (r.difficulty.includes('Beginner')) difficultyBadgeClass = 'badge-easy';
        if (r.difficulty === 'Advanced') difficultyBadgeClass = 'badge-hard';

        // Render tags
        const tagsHtml = r.tags.map(t => `<span class="roadmap-tag-pill">${t}</span>`).join('');

        html += `
            <div class="roadmap-card animate-fade">
                <div>
                    <div class="card-header-row">
                        <div class="roadmap-icon-container ${r.colorClass}">
                            <i class="lucide-${r.icon}"></i>
                        </div>
                        <span class="card-badge ${difficultyBadgeClass}">
                            ${r.difficulty}
                        </span>
                    </div>

                    <div class="roadmap-duration">
                        <i class="lucide-clock" style="width: 13px; height: 13px;"></i>
                        <span>Preparation: ${r.duration}</span>
                    </div>
                    
                    <h3 class="roadmap-title-text">${r.title}</h3>
                    <p class="roadmap-desc">${r.desc}</p>
                </div>

                <div>
                    <div class="roadmap-tags">
                        ${tagsHtml}
                    </div>

                    <div class="roadmap-actions">
                        <button class="btn btn-primary" onclick="window.open('${r.url}', '_blank')" style="flex-grow: 1; justify-content: center; font-size: 0.85rem; padding: 0.55rem 1rem;">
                            <i class="lucide-external-link" style="margin-right: 0.4rem;"></i>
                            <span>View Path</span>
                        </button>
                        <button class="btn btn-secondary" onclick="copyRoadmapLink('${r.url}')" style="justify-content: center; font-size: 0.85rem; padding: 0.55rem 1rem;" title="Copy Roadmap Link">
                            <i class="lucide-copy"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
    
    // Refresh icons
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

/**
 * Filter the roadmaps dynamically based on input events
 */
function setupFilters() {
    const searchInput = document.getElementById('roadmap-search-input');
    const difficultyFilter = document.getElementById('roadmap-difficulty-filter');

    const filterHandler = () => {
        const query = (searchInput ? searchInput.value : '').toLowerCase().trim();
        const difficulty = difficultyFilter ? difficultyFilter.value : '';

        const filtered = ROADMAPS_DATA.filter(r => {
            const matchesQuery = !query || 
                r.title.toLowerCase().includes(query) ||
                r.desc.toLowerCase().includes(query) ||
                r.tags.some(t => t.toLowerCase().includes(query));

            const matchesDifficulty = !difficulty || r.difficulty === difficulty;

            return matchesQuery && matchesDifficulty;
        });

        renderRoadmaps(filtered);
    };

    if (searchInput) searchInput.addEventListener('input', filterHandler);
    if (difficultyFilter) difficultyFilter.addEventListener('change', filterHandler);
}

/**
 * Copy roadmap link to clipboard and show toast
 * @param {string} url Signed S3 PDF url
 */
window.copyRoadmapLink = function(url) {
    if (window.copyToClipboard) {
        window.copyToClipboard(url, 'Roadmap PDF link copied to clipboard!');
    } else {
        navigator.clipboard.writeText(url)
            .then(() => alert('Roadmap PDF link copied to clipboard!'))
            .catch(() => alert('Failed to copy roadmap link.'));
    }
};
