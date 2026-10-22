import { Component } from 'react';
import { StatePage } from './StateView';

export default class PageErrorBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidUpdate(previous) {
    if (this.state.failed && previous.resetKey !== this.props.resetKey) this.setState({ failed: false });
  }
  render() {
    if (this.state.failed) return <StatePage standalone={this.props.standalone} kind="error" title="This page couldn’t be displayed." description="Something went wrong while opening this page. You can try again or return to the home page." actions={[{label:'Try again',onClick:()=>this.setState({failed:false})}, {label:'Go to home',to:'/',secondary:true}]}/>;
    return this.props.children;
  }
}
