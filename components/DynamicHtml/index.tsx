import React, { useEffect, useState } from 'react';
import parse from 'html-react-parser';
import classnames from 'classnames';

type Params = {
  text: string;
  className?: any;
  length?: number;
  style?: object;
};

const DynamicHtml = ({ text, className, length = 150, style }: Params) => {
  const [showMore, setShowMore] = useState<boolean>(text.length > length);
  const defaultClass: string = showMore ? 'show-ellipse' : '';

  useEffect(() => {
    setShowMore(text.length > length);
  }, [text])

  return (
    <>
      <div
        className={classnames(defaultClass, className)}
        style={style}
      >
        {parse(text)}
      </div>
      {text.length > length && (
        <div
          style={{
            cursor: "pointer",
            fontSize: 12,
            marginBottom: 10,
            color: '#096DD9'
          }}
          onClick={() => {setShowMore(!showMore)}}
        >
          { showMore ? "Show more" : "Show less" }
        </div>
      )}
    </>
  )
};

export default DynamicHtml;