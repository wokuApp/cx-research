import {defineConfig} from '@playwright/test';
export default defineConfig({testDir:'./e2e-live',fullyParallel:false,use:{baseURL:'http://127.0.0.1:5181',headless:true},webServer:{command:'npm run dev -- --port 5181 --strictPort',url:'http://127.0.0.1:5181',reuseExistingServer:false,env:{VITE_USE_MOCK_API:'false'}},reporter:'list'});
