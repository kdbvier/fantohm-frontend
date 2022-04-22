import { SvgIcon, Link } from "@material-ui/core";
import { ReactComponent as GitHub } from "../../assets/icons/github.svg";
import { ReactComponent as Medium } from "../../assets/icons/medium.svg";
import { ReactComponent as Twitter } from "../../assets/icons/twitter.svg";
import { ReactComponent as Discord } from "../../assets/icons/discord.svg";
import { ReactComponent as Telegram } from "../../assets/icons/telegram.svg";

export default function Social() {
  return (
    <div className="social-row">
      <Link href="https://github.com/fantohm-dev" target="_blank">
        <SvgIcon color="primary" component={GitHub} />
      </Link>

      <Link href="https://medium.com/fantohm" target="_blank">
        <SvgIcon color="primary" component={Medium} />
      </Link>

      <Link href="https://twitter.com/FantohmDAO" target="_blank">
        <SvgIcon color="primary" component={Twitter} />
      </Link>

      <Link href="https://discord.gg/fantohm" target="_blank">
        <SvgIcon color="primary" component={Discord} />
      </Link>

        <Link href="https://t.me/fantohm" target="_blank">
            <SvgIcon color="primary" component={Telegram} />
        </Link>

    </div>
  );
}
