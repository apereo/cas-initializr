import { onCLS, onLCP, onINP, onTTFB, onFCP } from 'web-vitals';

function reportWebVitals(metric: any) {
    console.log(metric);
}

onCLS(reportWebVitals);
onLCP(reportWebVitals);
onINP(reportWebVitals);
onTTFB(reportWebVitals);
onFCP(reportWebVitals);

export default reportWebVitals;
