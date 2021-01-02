import React, { useContext } from 'react';
import { observer } from 'mobx-react-lite';
import StoreContext from '../../contexts/StoreContext';

import UiStore from 'src/frontend/stores/UiStore';
import FileStore from 'src/frontend/stores/FileStore';
import { IconSet } from 'widgets';
import OutlinerToggle from '../';
import { ToolbarButton, ToolbarToggleButton } from 'widgets/menus';
import { FileRemoval } from 'src/frontend/components/RemovalAlert';
import TagFilesPopover from 'src/frontend/containers/AppToolbar/TagFilesPopover';
import Searchbar from './Searchbar';
import { SortCommand, ViewCommand } from './Menus';

// Tooltip info
export const enum Tooltip {
  TagFiles = 'Quick add or delete tags to selection',
  Select = 'Selects or deselects all images',
  Delete = 'Delete selected missing images from library',
  Back = 'Back to content panel',
}

const OutlinerToggle = observer(() => {
  const { uiStore } = useContext(StoreContext);

  return (
    <button
      autoFocus
      id="outliner-toggle"
      className="btn btn-icon"
      aria-controls="outliner"
      aria-pressed={uiStore.isOutlinerOpen}
      onClick={uiStore.toggleOutliner}
      tabIndex={0}
    >
      <span className="btn-content-icon" aria-hidden="true">
        {uiStore.isOutlinerOpen ? IconSet.ARROW_LEFT : IconSet.ARROW_RIGHT}
      </span>
      <span className="btn-content-text hidden">Toggle Outliner</span>
    </button>
  );
});

const PrimaryCommands = observer((props: { uiStore: UiStore; fileStore: FileStore }) => {
  const { uiStore, fileStore } = props;

  return (
    <>
      <OutlinerToggle />
      <FileSelectionCommand uiStore={uiStore} fileStore={fileStore} />

      <Searchbar />

      {/* TODO: Put back tag button (or just the T hotkey) */}
      {fileStore.showsMissingContent ? (
        // Only show option to remove selected files in toolbar when viewing missing files */}
        <RemoveFilesPopover uiStore={uiStore} />
      ) : (
        // Only show when not viewing missing files (so it is replaced by the Delete button)
        <TagFilesPopover />
      )}

      <SortCommand fileStore={fileStore} />

      <ViewCommand uiStore={uiStore} />
    </>
  );
});

export default PrimaryCommands;

export const SlideModeCommand = ({ uiStore }: { uiStore: UiStore }) => {
  return (
    <ToolbarButton
      showLabel="always"
      icon={IconSet.ARROW_LEFT}
      onClick={uiStore.disableSlideMode}
      text={Tooltip.Back}
      tooltip={Tooltip.Back}
    />
  );
};

const FileSelectionCommand = observer((props: { uiStore: UiStore; fileStore: FileStore }) => {
  const { uiStore, fileStore } = props;

  const allFilesSelected = uiStore.fileSelection.size === fileStore.fileList.length;
  // If everything is selected, deselect all. Else, select all
  const handleToggleSelect = () => {
    uiStore.fileSelection.size === fileStore.fileList.length
      ? uiStore.clearFileSelection()
      : uiStore.selectAllFiles();
  };

  return (
    <ToolbarToggleButton
      showLabel="always"
      icon={allFilesSelected ? IconSet.SELECT_ALL_CHECKED : IconSet.SELECT_ALL}
      onClick={handleToggleSelect}
      pressed={allFilesSelected}
      text={uiStore.fileSelection.size}
      tooltip={Tooltip.Select}
    />
  );
});

const RemoveFilesPopover = observer(({ uiStore }: { uiStore: UiStore }) => {
  return (
    <>
      <ToolbarButton
        icon={IconSet.DELETE}
        disabled={uiStore.fileSelection.size === 0}
        onClick={uiStore.openToolbarFileRemover}
        text="Delete"
        tooltip={Tooltip.Delete}
        // Giving it a warning intent will make it stand out more - it is usually hidden so it might not be obviously discovered
        // intent="warning"
      />
      <FileRemoval />
    </>
  );
});
