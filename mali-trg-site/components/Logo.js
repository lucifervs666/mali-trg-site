export default function Logo({ size = 'sm', kicker, onPhoto }) {
  if (size === 'lg') {
    return (
      <div style={{ textAlign: 'center' }}>
        {kicker ? <span className={`kicker${onPhoto ? ' kicker--onphoto' : ''}`}>{kicker}</span> : null}
        <h1 className={`wordmark${onPhoto ? ' wordmark--onphoto' : ''}`}>Mali Trg</h1>
      </div>
    );
  }
  return <span className="logo-word">Mali Trg</span>;
}
