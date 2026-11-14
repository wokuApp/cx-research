import {defineConfig} from '@playwright/test';
export default defineConfig({testDir:'./e2e-preparation',use:{baseURL:'http://127.0.0.1:5183',headless:true},webServer:{command:'npm run dev -- --port 5183 --strictPort',url:'http://127.0.0.1:5183',reuseExistingServer:false,env:{VITE_USE_MOCK_API:'false',VITE_SURVEY_PREPARING:'true'}},reporter:'list'});
