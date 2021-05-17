import React from 'react';
import {Avatar} from 'antd';
import {getInitialName} from '../../utilities/utils';
import Link from "next/link";


interface ICustomAvatar2Props {
  person: {
    fullname: string
    slug: string
  }
  size?: number
}

const CustomAvatar2: React.FunctionComponent<ICustomAvatar2Props> = ({person, size = 40}) => {
  return (
    <Link href={`/${person.slug}`}>
      <Avatar
        size={size}
        style={{
          marginRight: size >= 100 ? 40 : 5,
          background: 'linear-gradient(140deg, #F833CD, #1734CC)',
          borderRadius: 100,
          textAlign: 'center',
          lineHeight: `${size}px`,
          color: 'white',
          fontSize: size >= 100 ? '3rem' : '1rem',
          userSelect: 'none',
          cursor: 'pointer'
        }}
      >
        {person.fullname && getInitialName(person.fullname)}
      </Avatar>
    </Link>
  )
}

export default CustomAvatar2;
