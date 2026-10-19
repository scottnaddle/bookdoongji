import { registerRootComponent } from "expo";
import App from "./App";

// 모노레포에서는 expo/AppEntry 경로가 hoisting 위치에 따라 달라지므로 진입점을 직접 등록한다
registerRootComponent(App);
