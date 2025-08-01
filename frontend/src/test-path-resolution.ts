// Test file to verify module resolution with relative paths
import { IncidentDetail } from './modules/incidents/components/IncidentDetail/IncidentDetail';
import { IncidentForm } from './modules/incidents/components/IncidentForm/IncidentForm';
import { IncidentList } from './modules/incidents/components/IncidentList/IncidentList';

console.log('Module resolution test with relative paths:');
console.log('IncidentDetail:', IncidentDetail ? '✅ Found' : '❌ Not found');
console.log('IncidentForm:', IncidentForm ? '✅ Found' : '❌ Not found');
console.log('IncidentList:', IncidentList ? '✅ Found' : '❌ Not found');
