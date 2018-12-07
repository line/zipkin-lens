/*
 * Copyright 2018 LINE Corporation
 *
 * LINE Corporation licenses this file to you under the Apache License,
 * version 2.0 (the "License"); you may not use this file except in compliance
 * with the License. You may obtain a copy of the License at:
 *
 *   https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations
 * under the License.
 */

import PropTypes from 'prop-types';
import React from 'react';
import moment from 'moment';
import { CSSTransition } from 'react-transition-group';
import { Link } from 'react-router-dom';


import Timeline from '../../Timeline';
import Badge from '../../Common/Badge';
import Button from '../../Common/Button';
import { getErrorTypeColor } from '../../../util/color';
import { detailedTraceSummary } from '../../../zipkin';

const propTypes = {
  traceSummary: PropTypes.shape({}).isRequired,
  clockSkewCorrectedTrace: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  handleBadgeClick: PropTypes.func.isRequired,
};

const getBarColor = (infoClass) => {
  switch (infoClass) {
    case 'trace-error-transient':
      return getErrorTypeColor('transient');
    case 'trace-error-critical':
      return getErrorTypeColor('critical');
    default:
      return getErrorTypeColor('none');
  }
};

class Trace extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isActive: false,
      isTimelineShown: false,
    };
    this.handleTimelineShownToggle = this.handleTimelineShownToggle.bind(this);
  }

  componentDidMount() {
    /* Trigger initial state change for CSSTransition */
    setTimeout(() => { this.setState({ isActive: true }); }, 0);
    setTimeout(() => { this.setState({ isActive: false }); }, 100);
  }

  handleTimelineShownToggle() {
    const { isTimelineShown } = this.state;
    this.setState({ isTimelineShown: !isTimelineShown });
  }

  render() {
    const { traceSummary, handleBadgeClick, clockSkewCorrectedTrace } = this.props;
    const { isActive, isTimelineShown } = this.state;

    const detailed = detailedTraceSummary(clockSkewCorrectedTrace);

    return (
      <div className="traces__trace">
        <div className="traces__trace-box">
          <div
            className="traces__trace-summary"
            role="presentation"
            onClick={this.handleTimelineShownToggle}
          >
            <div className="traces__trace-bar-wrapper">
              <span
                className="traces__trace-bar-space"
                style={{ width: `${traceSummary.width}%` }}
              >
                <CSSTransition
                  in={isActive}
                  classNames="traces__trace-bar"
                  timeout={500}
                >
                  <div
                    className="traces__trace-bar"
                    style={{ background: getBarColor(traceSummary.infoClass) }}
                  />
                </CSSTransition>
              </span>
              <div>
                <div className="traces__trace-info--left">
                  <div className="traces__trace-info-content">
                    {`${traceSummary.totalSpans}spans`}
                  </div>
                  <div className="traces__trace-info-content">
                    {traceSummary.durationStr}
                  </div>
                </div>
                <div className="traces__trace-info--right">
                  <div className="traces__trace-info-content">
                    {moment(traceSummary.timestamp / 1000).format('MM/DD HH:mm:ss:SSS')}
                  </div>
                </div>
              </div>
            </div>
            {
              traceSummary.servicePercentage
                ? (
                  <div className="traces__trace-bar-wrapper">
                    <span
                      className="traces__trace-bar-space"
                      style={{ width: `${traceSummary.servicePercentage}%` }}
                    >
                      <CSSTransition
                        in={isActive}
                        classNames="traces__trace-bar"
                        timeout={500}
                      >
                        <div
                          className="traces__trace-bar"
                          style={{ background: '#009bdc' }}
                        />
                      </CSSTransition>
                    </span>
                    <div>
                      <div className="traces__trace-info--left">
                        <div className="traces__trace-info-content">
                          {`${traceSummary.servicePercentage}%`}
                        </div>
                      </div>
                    </div>
                  </div>
                )
                : null
            }
            <div className="traces__trace-badges-wrapper">
              {traceSummary.serviceDurations.map(service => (
                <Badge
                  key={service.name}
                  value={service.name}
                  text={`${service.name} x ${service.count}`}
                  onClick={handleBadgeClick}
                />
              ))}
            </div>
          </div>
          <div className="traces__trace-link-wrapper">
            <Link
              to={{ pathname: `/trace/${traceSummary.traceId}` }}
            >
              <Button className="traces__trace-link">
                <i className="fas fa-door-open" />
              </Button>
            </Link>
          </div>
        </div>
        {
          isTimelineShown
            ? (
              <div className="traces__trace-timeline">
                <Timeline
                  startTs={0}
                  endTs={detailed.duration}
                  traceSummary={detailed}
                />
              </div>
            )
            : null
        }
      </div>
    );
  }
}

Trace.propTypes = propTypes;

export default Trace;
