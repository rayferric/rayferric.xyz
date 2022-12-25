import styles from './dropdown.module.css';

import { InputField } from './input-field';
import {
  faChevronDown,
  faChevronUp,
  IconDefinition
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Component,
  createRef,
  RefObject,
  useEffect,
  useRef,
  useState
} from 'react';

type Item = {
  value: string;
  icon: IconDefinition;
};

type Props = {
  items: Item[];
  defaultItemIndex?: number;
  className?: string;
  placeholder?: string;
  onChange?: (index: number) => void;
  ref?: RefObject<Dropdown>;
};

type State = {
  expanded: boolean;
  query: string;
  selection: number;
};

export default class Dropdown extends Component<Props, State> {
  state = {
    expanded: false,
    query: '',
    selection:
      this.props.defaultItemIndex === undefined
        ? -1
        : this.props.defaultItemIndex
  };

  private inputRef = createRef<HTMLInputElement>();
  private listener = () => {
    this.setState({ expanded: false });
  };

  getSelection() {
    return this.state.selection;
  }

  resetSelection() {
    this.setState({ selection: -1 });
  }

  componentDidMount() {
    document.addEventListener('click', this.listener);
  }

  componentWillUnmount() {
    document.removeEventListener('click', this.listener);
  }

  componentDidUpdate(prevProps: Props, prevState: State) {
    if (this.state.expanded !== prevState.expanded) {
      if (this.state.expanded) {
        this.setState({ query: '' });
        this.inputRef.current!.value = '';
        this.inputRef.current!.focus();
      }
    }

    if (this.state.selection !== prevState.selection) {
      if (this.props.onChange) this.props.onChange(this.state.selection);
    }
  }

  render() {
    if (this.state.selection >= this.props.items.length) this.resetSelection();

    return (
      <div
        className={
          styles['dropdown'] +
          (this.props.className ? ' ' + this.props.className : '')
        }
      >
        <InputField
          className={styles['input'] + (this.state.expanded ? ' expanded' : '')}
          placeholder={this.props.placeholder || 'Type to filter...'}
          icon={faChevronDown}
          onIconClick={(event) => {
            if (!this.state.expanded)
              setTimeout(() => this.setState({ expanded: true }), 0); // setTimeout bypasses body event listener
            // Otherwise body listener calls setExpanded(false)
          }}
          onChange={(event, value) => {
            this.setState({ query: value });
          }}
          onInputClick={(event) => {
            if (this.state.expanded) event.stopPropagation();
            if (!this.state.expanded)
              setTimeout(() => this.setState({ expanded: true }), 0); // setTimeout bypasses body event listener
          }}
          inputRef={this.inputRef}
          onReturn={() => {
            for (const [index, item] of this.props.items.entries()) {
              const match = item.value
                .toLowerCase()
                .replaceAll(' ', '')
                .includes(this.state.query.toLowerCase().replaceAll(' ', ''));

              if (match) {
                this.setState({ selection: index });
                break;
              }
            }
            this.setState({ expanded: false });
          }}
          onEscape={() => {
            this.setState({ expanded: false });
          }}
        />
        {!this.state.expanded && this.state.selection !== -1 && (
          <div
            className={styles['selection']}
            onClick={(event) => {
              setTimeout(() => this.setState({ expanded: true }), 0); // setTimeout bypasses body event listener
            }}
          >
            <FontAwesomeIcon
              className={styles['selection-icon']}
              icon={this.props.items[this.state.selection].icon}
            />
            <div className={styles['selection-text']}>
              {this.props.items[this.state.selection].value}
            </div>
          </div>
        )}
        <div
          className={styles['list'] + (this.state.expanded ? ' expanded' : '')}
        >
          {this.props.items.map((item, index) => {
            const match = item.value
              .toLowerCase()
              .replaceAll(' ', '')
              .includes(this.state.query.toLowerCase().replaceAll(' ', ''));

            return (
              match && (
                <div
                  className={styles['list-item']}
                  key={index}
                  onClick={(event) => {
                    // Body listener calls setExpanded(false)
                    this.setState({ selection: index });
                  }}
                >
                  <FontAwesomeIcon
                    className={styles['list-item-icon']}
                    icon={item.icon}
                  />
                  <div className={styles['list-item-text']}>{item.value}</div>
                </div>
              )
            );
          })}
        </div>
        {/* {expanded && <div className={styles['click-capture']} onClick={() => setExpanded(false)} />} */}
      </div>
    );
  }
}
