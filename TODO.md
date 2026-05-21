# TODO: Fix Data Flow and Anomaly Detection

## Steps to Complete

1. **Update backend/app.py** 
   - Modify /detect-anomaly to filter data by month and hour for more accurate anomaly detection using hour-specific mean and std.

2. **Update AnomalyDetection.jsx** 
   - Add day input field to the form in manual mode.
   - Change anomaly result display to "Anomaly" or "Normal" instead of "Anomaly Detected" or "Normal".

3. **Update ZoneAnalysis.jsx** 
   - Add selectedMetric state and dropdown for Metric selection (Power, Power Difference).
   - Ensure useEffect includes selectedMetric.

4. **Test and Verify**
   - Ensure anomaly detection button works and displays correct result.
   - Verify power trend chart displays with predicted power at center and surrounding values.
   - Confirm data flows correctly to zone wise analysis.
