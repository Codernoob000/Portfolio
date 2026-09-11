import {
  splitTypographyProps,
  usePageTypography,
  COMPLETE_SHELF_TYPOGRAPHY,
  type PageTypographyProps,
} from "./pageTypography";
import { LandingPageFrame, type LandingPageProps } from "./LandingPageFrame";
export { LandingPageFrame, applyBackgroundPresentation } from "./LandingPageFrame";
export type { LandingPageFrameProps, LandingPageProps } from "./LandingPageFrame";

export function CompleteShelfLandingPage(props: LandingPageProps & PageTypographyProps) {
  const [type, frame] = splitTypographyProps(props);
  const customization = usePageTypography(COMPLETE_SHELF_TYPOGRAPHY, type);
  return <LandingPageFrame {...frame} customization={customization} title="Gattu Rithvik — Portfolio in Seven Volumes" sourceUrl="/landing-pages/complete-shelf-v2.html" />;
}
