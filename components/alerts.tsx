import styles from './alerts.module.css';

import { Button } from './button';
import { Component } from 'react';

type AlertType = 'error' | 'warning' | 'success';

type Alert = {
  show: boolean;
  message: string;
  type: AlertType;
};

type Confirmation = {
  show: boolean;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
};

type State = {
  alert: Alert;
  confirmation: Confirmation;
};

export default class Alerts extends Component<{}, State> {
  static defaultState: State = {
    alert: {
      show: false,
      message: '',
      type: 'error'
    },
    confirmation: {
      show: false,
      message: '',
      onConfirm: () => {},
      onCancel: () => {}
    }
  };

  state = Alerts.defaultState;

  private alertTimeout: NodeJS.Timeout | null = null;

  private hideAlert() {
    if (!this.alertTimeout) return;

    clearTimeout(this.alertTimeout);
    this.setState({
      alert: {
        ...this.state.alert,
        show: false
      }
    });
  }

  private hideConfirmation() {
    this.setState({
      confirmation: {
        ...this.state.confirmation,
        show: false
      }
    });
  }

  render() {
    return (
      <div
        className={
          styles['alerts'] + (this.state.confirmation.show ? ' focused' : '')
        }
      >
        <div
          className={
            styles['alert'] +
            (this.state.alert.show ? ' shown ' : ' ') +
            this.state.alert.type
          }
          onClick={() => this.hideAlert()}
        >
          {this.state.alert.message}
        </div>
        <div
          className={
            styles['confirmation'] +
            (this.state.confirmation.show ? ' shown' : '')
          }
        >
          <div className={styles['confirmation-text']}>
            {this.state.confirmation.message}
          </div>
          <div className={styles['confirmation-buttons']}>
            <Button
              className={styles['confirmation-button']}
              onClick={() => {
                this.state.confirmation.onConfirm();
                this.hideConfirmation();
              }}
            >
              Confirm
            </Button>
            <Button
              className={styles['confirmation-button']}
              onClick={() => {
                this.state.confirmation.onCancel();
                this.hideConfirmation();
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    );
  }

  showAlert(message: string, type: AlertType) {
    // Hide the current alert
    this.hideAlert();

    // Show a new alert
    this.setState({
      alert: {
        show: true,
        message,
        type
      }
    });

    // Schedule a timeout to hide the new alert
    this.alertTimeout = setTimeout(
      () =>
        this.setState({
          alert: {
            ...this.state.alert,
            show: false
          }
        }),
      5000
    );
  }

  async confirmBox(message: string) {
    return new Promise((resolve, reject) => {
      this.setState({
        confirmation: {
          show: true,
          message,
          onConfirm: () => {
            resolve(undefined);
          },
          onCancel: () => {
            reject();
          }
        }
      });
    });
  }
}
