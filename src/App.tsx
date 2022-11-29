import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import {Prism as SyntaxHighlighter} from 'react-syntax-highlighter'
import 'github-markdown-css';
import mdConfig from "./md.config";
import {useEffect, useState} from "react";
import { xonokai } from 'react-syntax-highlighter/dist/esm/styles/prism';
import styles from './index.module.scss'

import {MenuList, MenuItem, Collapse, ListItemText, Container, Grid, Box} from '@mui/material';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';

const InnerMenu = (props) => {
    const [open, setOpen] = useState(false);
    const {pl = 2, children = [], onClick, menuKey, selectedKey} = props;
    const onMenuClick = (info, key) => typeof onClick === 'function' && onClick(info, key);

    return children.length ? <>
        <MenuItem sx={{ pl }} onClick={() => setOpen(!open)} selected={selectedKey && selectedKey.indexOf(menuKey) === 0}>
            <ListItemText>{props.title}</ListItemText>
            {open ? <ExpandLess /> : <ExpandMore />}
        </MenuItem>
        <Collapse in={open} timeout="auto" unmountOnExit>
            <MenuList component="div" disablePadding>
                {
                    children?.length > 0 && children.map((item, index) => {
                        if (!item.children?.length) return <MenuItem
                            sx={{ pl: pl + 4 }}
                            key={index}
                            onClick={() => onMenuClick(item, `${menuKey}-${index}`)}
                            selected={`${menuKey}-${index}` === selectedKey}
                        >
                            {item.title}
                        </MenuItem>
                        return <InnerMenu menuKey={`${menuKey}-${index}`} selectedKey={selectedKey} key={index} {...item} pl={pl + 4} onClick={onClick} />
                    })
                }
            </MenuList>
        </Collapse>
    </> :  <MenuItem selected={menuKey === selectedKey} sx={{ pl }} onClick={() => onMenuClick(props, menuKey)}>{props.title}</MenuItem>
}

const MarkDown = () => {

    const [md, setMd] = useState('');
    const [selectedKey, setSelectedKey] = useState('');
    const [menuList, setMenuList] = useState<Array<{
        title: string
        name: string
        md: any
    }>>([]);

    const onMenuClick = (info, key) => {
        info.md && setMd(info.md);
        setSelectedKey(key);
    }

    useEffect(() => {
        const menu = [] as any;
        const mdFiles = (require as any).context('./md/', true, /\.md$/);
        const filePaths = mdFiles.keys();
        filePaths.forEach(filePath => {
            const pathList = filePath.replace('./', '').replace('.md', '').split('/');
            let list = menu;
            let length = pathList.length;
            let config = mdConfig;
            pathList.forEach((path, index) => {
                const temp = list.find(item => item.name === path);
                if (index !== length - 1) {
                    if (!temp) {
                        const target = config[path] || {};
                        const result = {
                            name: path,
                            title: target.title,
                            children: []
                        };
                        list.push(result);
                        list = result.children;
                    } else {
                        !temp.children && (temp.children = []);
                        list = temp.children;
                    }
                    config = mdConfig[path];
                } else {
                    list.push({
                        name: path,
                        title: config[path] || path,
                        md: mdFiles(filePath).default
                    })
                }
            });
        });

        console.log(menu)
        setMenuList(menu);
    }, []);

    return <Container className={styles.mdPage}>
        <Grid container spacing={2}>
            <Grid xs={4} item>
                <MenuList>
                    {
                        menuList?.length > 0 && menuList.map((menu, index) =>
                            <InnerMenu selectedKey={selectedKey} menuKey={'' + index} key={index} {...menu} onClick={onMenuClick} />)
                    }
                </MenuList>
            </Grid>
            <Grid xs={8} item>
                <Box sx={{m: '20px'}} >
                    <ReactMarkdown
                        children={md}
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeRaw]}
                        className={'markdown-body'}
                        components={{
                            code({node, inline, className, children, ...props}) {
                                return <SyntaxHighlighter
                                    children={String(children).replace(/\n$/, '')}
                                    PreTag="div"
                                    style={xonokai}
                                    language={'javascript'}
                                    {...props}
                                />
                            }
                        }}
                    />
                </Box>
            </Grid>
        </Grid>
    </Container>
}

export default MarkDown;
