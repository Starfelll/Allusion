import React, { useContext, useState, useCallback, useMemo, useEffect } from 'react';
import path from 'path';
import { observer } from 'mobx-react-lite';

import StoreContext from '../../contexts/StoreContext';
import ImageInfo from '../../components/ImageInfo';
import FileTags from '../../components/FileTag';
import { ClientFile } from '../../../entities/File';
import { clamp } from '@blueprintjs/core/lib/esm/common/utils';
import IconSet from 'components/Icons';
import { Icon } from '@blueprintjs/core';
import { MissingImageFallback } from '../ContentView/GalleryItem';

const sufixes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
const getBytes = (bytes: number) => {
  if (bytes <= 0) {
    return '0 Bytes';
  }
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return (bytes / Math.pow(1024, i)).toFixed(2) + ' ' + sufixes[i];
};

const MultiFileInfo = observer(({ files }: { files: ClientFile[] }) => {
  return (
    <section>
      <p>Selected {files.length} files</p>
    </section>
  );
});

const Carousel = ({ items }: { items: ClientFile[] }) => {
  // NOTE: maxItems is coupled to the CSS! Max is 10 atm (see inspector.scss)
  const maxItems = 7;
  const [scrollIndex, setScrollIndex] = useState(0);

  // Add some padding items so that you can scroll the last item to the front
  const paddedItems = useMemo(() => {
    const padding = Array.from(Array(maxItems - 1));
    setScrollIndex(items.length - 1);
    return [...padding, ...items];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length]);

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      const delta = e.deltaY > 0 ? -1 : 1;
      setScrollIndex((v) => clamp(v + delta, 0, paddedItems.length - 1));
    },
    [paddedItems.length],
  );

  return (
    <div id="carousel" onWheel={handleWheel}>
      {/* Show a stack of the first N images (or fewer) */}
      {paddedItems.slice(scrollIndex, scrollIndex + maxItems).map((file, index) =>
        !file ? null : (
          <div
            key={file.id}
            className={`item child-${
              index
              // TODO: Could add in and out transition, but you'd also need to know the scroll direction for that
              // }${index === 0 ? ' item-enter' : ''
              // }${index === maxItems - 1 ? ' item-exit' : ''
            }`}
          >
            {!file.isBroken ? (
              <img
                src={file.thumbnailPath}
                onClick={() => setScrollIndex(scrollIndex - maxItems + 1 + index)}
              />
            ) : (
              <div style={{ textAlign: 'center' }}>
                <MissingImageFallback />
              </div>
            )}
          </div>
        ),
      )}
    </div>
  );
};

const Inspector = observer(() => {
  const { uiStore } = useContext(StoreContext);
  const selectedFiles = uiStore.clientFileSelection;

  let selectionPreview;
  let headerText;
  let headerSubtext;

  if (selectedFiles.length === 0) {
    headerText = 'No image selected';
  } else if (selectedFiles.length === 1) {
    const singleFile = selectedFiles[0];
    const ext = singleFile.absolutePath
      .substr(singleFile.absolutePath.lastIndexOf('.') + 1)
      .toUpperCase();
    selectionPreview = !singleFile.isBroken ? (
      <img
        src={singleFile.absolutePath}
        style={{ cursor: uiStore.isSlideMode ? undefined : 'zoom-in' }}
        onClick={uiStore.enableSlideMode}
      />
    ) : (
      <div style={{ textAlign: 'center' }}>
        <MissingImageFallback />
      </div>
    );
    headerText = path.basename(singleFile.absolutePath);
    headerSubtext = `${ext} image - ${getBytes(singleFile.size)}}`;
  } else {
    // Stack effects: https://tympanus.net/codrops/2014/03/05/simple-stack-effects/
    // TODO: Would be nice to hover over an image and that all images before that get opacity 0.1
    // Or their transform is adjusted so they're more spread apart or something
    // TODO: Maybe a dropshadow?
    selectionPreview = <Carousel items={selectedFiles} />;
    headerText = `${selectedFiles[0].name} and ${selectedFiles.length - 1} more`;
    headerSubtext = getBytes(selectedFiles.reduce((acc, f) => acc + f.size, 0));
  }

  if (selectedFiles.length > 0) {
    return (
      <aside id="inspector" className={`${uiStore.isInspectorOpen ? 'inspectorOpen' : ''}`}>
        <section id="filePreview">{selectionPreview}</section>

        <section id="fileOverview">
          <div className="inpectorHeading">{headerText}</div>
          <small>{headerSubtext}</small>
        </section>

        {selectedFiles.length === 1 ? (
          <ImageInfo file={selectedFiles[0]} />
        ) : (
          <MultiFileInfo files={selectedFiles} />
        )}
        <FileTags files={selectedFiles} />
      </aside>
    );
  } else {
    return (
      <aside id="inspector" className={`${uiStore.isInspectorOpen ? 'inspectorOpen' : ''}`}>
        <section id="filePreview" />
        <section id="fileOverview">
          <div className="inpectorHeading">{headerText}</div>
        </section>
      </aside>
    );
  }
});

export default Inspector;
