import { defineConfig } from '@playwright/test';
export default defineConfig({testDir:'./e2e',fullyParallel:false,use:{baseURL:'http://127.0.0.1:5180',headless:true},webServer:{command:'npm run dev -- --port 5180 --strictPort',url:'http://127.0.0.1:5180',reuseExistingServer:true},reporter:'list'});
