import { Drawer } from "@material-ui/core";
import NavContent from "./NavContent.jsx";
import "./sidebar.scss";

function Sidebar() {
  return (
    <div className={`sidebar`} id="sidebarContent">
      <Drawer variant="permanent" anchor="left" PaperProps={{ elevation: 5 }}>
        <NavContent />
      </Drawer>
    </div>
  );
}

export default Sidebar;
