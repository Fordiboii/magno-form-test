import { TutorialSitDownScreen } from "../screens/tutorialScreens/TutorialSitDownScreen";
import { TutorialTaskScreen } from "../screens/tutorialScreens/TutorialTaskScreen";
import { TutorialTrialScreen } from "../screens/tutorialScreens/TutorialTrialScreen";
import { MotionScreen } from "../screens/MotionScreen";
import { ResultsScreen } from "../screens/ResultsScreen";
import { LandingPageScreen } from "../screens/LandingPageScreen";

export interface Screens {
    landingPageScreen: LandingPageScreen,
    tutorialSitDownScreen: TutorialSitDownScreen,
    tutorialTaskScreen: TutorialTaskScreen,
    tutorialTrialScreen: TutorialTrialScreen,
    motionScreen: MotionScreen,
    resultsScreen: ResultsScreen | undefined
}