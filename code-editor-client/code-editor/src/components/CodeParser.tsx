// Add this new component to your file
import styles from "./CollaborativeEditor.module.css";
function CodeParser({ code }) {
  const [analysis, setAnalysis] = useState({
    timeComplexity: "O(1)",
    syntaxErrors: [],
    isAnalyzing: false,
  });

  useEffect(() => {
    const analyzeCode = async () => {
      if (!code?.trim()) {
        setAnalysis({
          timeComplexity: "N/A",
          syntaxErrors: [],
          isAnalyzing: false,
        });
        return;
      }

      setAnalysis((prev) => ({ ...prev, isAnalyzing: true }));

      try {
        // Mock API call - replace with actual code analysis endpoint
        const response = await fetch("http://localhost:8000/analyze-code", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ code }),
        });

        if (!response.ok) {
          throw new Error(`Analysis failed: ${response.status}`);
        }

        const data = await response.json();
        setAnalysis({
          timeComplexity: data.timeComplexity || "Unknown",
          syntaxErrors: data.syntaxErrors || [],
          isAnalyzing: false,
        });
      } catch (error) {
        console.error("Error analyzing code:", error);
        setAnalysis({
          timeComplexity: "Error analyzing",
          syntaxErrors: [],
          isAnalyzing: false,
        });
      }
    };

    // Debounce the analysis to avoid too many API calls
    const timer = setTimeout(() => {
      analyzeCode();
    }, 1000);

    return () => clearTimeout(timer);
  }, [code]);

  return (
    <div className={styles.codeParser}>
      <div className={styles.parserHeader}>Code Parser</div>
      <div className={styles.parserContent}>
        <div className={styles.parserSection}>
          <div className={styles.parserLabel}>Time Complexity:</div>
          <div className={styles.timeComplexity}>
            {analysis.isAnalyzing ? (
              <div className={styles.loadingIndicator}>
                <span>•</span>
                <span>•</span>
                <span>•</span>
              </div>
            ) : (
              analysis.timeComplexity
            )}
          </div>
        </div>

        <div className={styles.parserSection}>
          <div className={styles.parserLabel}>Syntax:</div>
          <div className={styles.syntaxStatus}>
            {analysis.isAnalyzing ? (
              <div className={styles.loadingIndicator}>
                <span>•</span>
                <span>•</span>
                <span>•</span>
              </div>
            ) : analysis.syntaxErrors.length === 0 ? (
              <span className={styles.syntaxValid}>✓ Valid</span>
            ) : (
              <div className={styles.syntaxErrors}>
                <span className={styles.syntaxInvalid}>✗ Invalid</span>
                <ul className={styles.errorList}>
                  {analysis.syntaxErrors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
