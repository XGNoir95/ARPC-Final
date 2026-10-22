import StateView, { Notice } from './StateView';

export function ContentUnavailable({ content, resource = 'content', compact = false }) {
  if (content?.loading) return <StateView compact={compact} kind="loading" title={`Loading ${resource}…`} description="This should only take a moment."/>;
  return <StateView compact={compact} kind="error" title={`We couldn’t load ${resource}.`} description="Please try again in a moment. You can return to the home page if the problem continues." actions={[{label:'Try again',onClick:content?.retry,busy:content?.refreshing}, {label:'Go to home',to:'/',secondary:true}]}/>;
}

export function ContentNotice({ content }) {
  return content?.error && content?.hasData ? <div className="mb-6"><Notice tone="info" title="Updates are temporarily unavailable." action={{label:'Try again',onClick:content.retry}} busy={content.refreshing}>You can still browse the information already loaded.</Notice></div> : null;
}
