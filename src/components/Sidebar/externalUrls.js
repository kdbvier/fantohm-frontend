import { ReactComponent as ForumIcon } from "../../assets/icons/forum.svg";
import { ReactComponent as GovIcon } from "../../assets/icons/governance.svg";
import { ReactComponent as DocsIcon } from "../../assets/icons/docs.svg";
import { ReactComponent as FeedbackIcon } from "../../assets/icons/feedback.svg";
import { SvgIcon } from "@material-ui/core";

const externalUrls = [
  {
    title: "Website",
    url: "https://www.fantohm.com/",
    icon: <SvgIcon color="primary" component={ForumIcon} />,
  },
  {
    title: "Governance",
    url: "https://snapshot.org/#/fantohmdao.eth",
    icon: <SvgIcon color="primary" component={GovIcon} />,
  },
  {
    title: "Docs",
    url: "https://fantohm.gitbook.io/documentation/",
    icon: <SvgIcon color="primary" component={DocsIcon} />,
  },
  // {
  //   title: "Feedback",
  //   url: "https://olympusdao.canny.io/",
  //   icon: <SvgIcon color="primary" component={FeedbackIcon} />,
  // },
];

export default externalUrls;
