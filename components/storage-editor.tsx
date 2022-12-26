import styles from './storage-editor.module.css';

import { Button } from './button';
import { InputField } from './input-field';
import { faFloppyDisk, faTrashCan } from '@fortawesome/free-regular-svg-icons';
import {
  faArrowRightFromBracket,
  faChevronRight,
  faDownload,
  faSearch,
  faUpload
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import prettyBytes from 'pretty-bytes';
import {
  createRef,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState
} from 'react';

import Context from '../src/context';

type Props = {
  shown: boolean;
  postId: string;
  onFinish?: () => void;
};

function downloadFile(url: string) {
  // Create a link and set the URL using `createObjectURL`
  const link = document.createElement('a');
  link.style.display = 'none';
  link.href = url;
  link.download = url.split('/').pop()!;

  // It needs to be added to the DOM so it can be clicked
  document.body.appendChild(link);
  link.click();

  // To make this work on Firefox we need to wait
  // a little while before removing it.
  setTimeout(() => {
    link.parentNode!.removeChild(link);
  }, 0);
}

export default function StorageEditor({ shown, postId, onFinish }: Props) {
  const context = useContext(Context);

  type File = {
    name: string;
    size: number;
    modified: string;
  };

  const [key, setKey] = useState(0); // Used to reset the panel
  const [files, setFiles] = useState<File[]>([]);
  const [query, setQuery] = useState('');

  const fetchFiles = useCallback(async () => {
    const response = await fetch(`/api/posts/${postId}?files`);
    const files = await response.json();
    setFiles(files);
  }, [postId]);

  // Fetch new files when the post ID is updated
  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  // Capture keyboard shortcuts and increment element key to reset the view
  // This every time the panel is shown
  // Additionally reset the query
  useEffect(() => {
    if (!shown) return;

    setKey((key) => key + 1);
    setQuery('');

    const listener = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && onFinish) onFinish();
    };

    document.addEventListener('keydown', listener);
    return () => document.removeEventListener('keydown', listener);
  }, [shown, onFinish]);

  const fileUploadRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    document.body.style.overflow = shown ? 'hidden' : 'auto';

    return () => {
      document.body.style.overflow = 'auto';
    }
  }, [shown]);

  return (
    <div className={styles['storage-editor'] + (shown ? ' shown' : '')}>
      <div className={styles['panel']} key={key}>
        <div className={styles['panel-row']}>
          <InputField
            className={styles['panel-row-input']}
            placeholder='Type to find files...'
            onChange={(_, value) => setQuery(value)}
            icon={faSearch}
          />
        </div>
        <div className={styles['panel-scrollable-area']}>
          {files.map((file, index) => {
            const match = file.name
              .toLowerCase()
              .replaceAll(' ', '')
              .includes(query.toLowerCase().replaceAll(' ', ''));

            if (!match) return null;

            let formattedSize = prettyBytes(file.size, { binary: true });

            // Capitalize binary prefix
            if (formattedSize.endsWith('iB'))
              formattedSize =
                formattedSize.slice(0, -3) +
                formattedSize.charAt(formattedSize.length - 3).toUpperCase() +
                'iB';

            const formattedDate = new Intl.DateTimeFormat('en-US', {
              dateStyle: 'long'
            }).format(new Date(file.modified));

            const nameRef = createRef<HTMLInputElement>();

            return [
              <div
                key={index * 2}
                className={styles['panel-row-label']}
              >{`"${file.name}" • ${formattedSize} • ${formattedDate}:`}</div>,
              <div key={index * 2 + 1} className={styles['panel-row']}>
                <InputField
                  className={styles['panel-row-input'] + ' file-item'}
                  placeholder={file.name}
                  onChange={() => {}}
                  icon={faChevronRight}
                  inputRef={nameRef}
                  onIconClick={async (_, value) => {
                    if (!value) {
                      // Show an error alert
                      context.alertsRef?.current?.showAlert(
                        'Please enter a new name for the file.',
                        'error'
                      );

                      return;
                    }

                    try {
                      const response = await fetch(
                        `/api/posts/${postId}/${file.name}`,
                        {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json'
                          },
                          body: JSON.stringify({
                            name: value
                          })
                        }
                      );

                      if (!response.ok)
                        throw new Error((await response.json()).message);

                      // Rename the file in the list
                      let newFiles = files.map((f) => {
                        if (f.name === file.name) f.name = value;
                        return f;
                      });

                      // Remove duplicates
                      newFiles = newFiles.filter(
                        (f, i) => newFiles.indexOf(f) === i
                      );

                      setFiles(newFiles);
                      nameRef.current!.value = '';
                    } catch (e) {
                      if (e instanceof Error) {
                        context.alertsRef?.current?.showAlert(
                          e.message,
                          'error'
                        );
                      }
                    }
                  }}
                />
                <div className={styles['panel-row-button-group']}>
                  <Button
                    className={styles['panel-row-button']}
                    onClick={() => {
                      downloadFile(`/api/posts/${postId}/${file.name}`);
                    }}
                  >
                    <FontAwesomeIcon
                      icon={faDownload}
                      className={styles['panel-row-button-icon']}
                    />
                  </Button>
                  <Button
                    className={styles['panel-row-button'] + ' error'}
                    onClick={async () => {
                      try {
                        const response = await fetch(
                          `/api/posts/${postId}/${file.name}`,
                          {
                            method: 'DELETE'
                          }
                        );

                        // Check for errors
                        if (!response.ok)
                          throw new Error((await response.json()).message);

                        // Update local files
                        setFiles(files.filter((f) => f.name !== file.name));

                        // Show a success alert
                        context.alertsRef?.current?.showAlert(
                          'File was deleted successfully.',
                          'success'
                        );
                      } catch (e) {
                        if (e instanceof Error) {
                          context.alertsRef?.current?.showAlert(
                            e.message,
                            'error'
                          );
                        }
                      }
                    }}
                  >
                    <FontAwesomeIcon
                      icon={faTrashCan}
                      className={styles['panel-row-button-icon']}
                    />
                  </Button>
                </div>
              </div>
            ];
          })}
        </div>
        <div className={styles['panel-row'] + ' not-wrapping'}>
          <Button
            className={styles['panel-row-button']}
            onClick={() => fileUploadRef.current?.click()}
          >
            <span className={styles['panel-row-button-content']}>Upload</span>
            <FontAwesomeIcon
              className={styles['panel-row-button-icon'] + ' mobile-only'}
              icon={faUpload}
            />
          </Button>
          <Button
            className={styles['panel-row-button']}
            onClick={() => {
              if (onFinish) onFinish();
            }}
          >
            <span className={styles['panel-row-button-content']}>Exit</span>
            <FontAwesomeIcon
              className={styles['panel-row-button-icon'] + ' mobile-only'}
              icon={faArrowRightFromBracket}
            />
          </Button>
        </div>
      </div>
      <input
        hidden
        ref={fileUploadRef}
        type='file'
        onChange={(e) => {
          if (!e.target.files) return;

          for (const file of e.target.files) {
            const reader = new FileReader();
            reader.addEventListener('load', async () => {
              try {
                const response = await fetch(
                  `/api/posts/${postId}/${file.name}`,
                  {
                    method: 'PUT',
                    headers: {
                      'Content-Type': 'text/plain'
                    },
                    body: reader.result
                  }
                );

                // Check for errors
                if (!response.ok)
                  throw new Error((await response.json()).message);

                // Fetch new file list
                fetchFiles();

                // Show a success alert
                context.alertsRef?.current?.showAlert(
                  'File was uploaded successfully.',
                  'success'
                );
              } catch (e) {
                if (e instanceof Error) {
                  context.alertsRef?.current?.showAlert(e.message, 'error');
                }
              }
            });
            reader.readAsDataURL(file);
          }
        }}
      />
    </div>
  );
}
