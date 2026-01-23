import { Config } from '@remotion/cli/config';

Config.setVideoImageFormat('jpeg');
Config.setOverwriteOutput(true);

// 設定輸出資料夾
Config.setOutputLocation('./out');

// 設定編碼器 (可選: h264, h265, vp8, vp9)
Config.setCodec('h264');
