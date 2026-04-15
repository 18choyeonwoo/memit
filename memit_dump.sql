--
-- PostgreSQL database dump
--

\restrict iVY9Bo8YwFEHIlQtIjMssKtQmU2rZvdHXCgW9W3lO9qMtN4XpuGxtO71oPecJ7z

-- Dumped from database version 15.17 (Debian 15.17-1.pgdg13+1)
-- Dumped by pg_dump version 15.17 (Debian 15.17-1.pgdg13+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: gallery; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.gallery (
    id integer NOT NULL,
    name character varying NOT NULL,
    description character varying,
    created_at timestamp without time zone NOT NULL,
    user_id integer NOT NULL
);


ALTER TABLE public.gallery OWNER TO postgres;

--
-- Name: gallery_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.gallery_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.gallery_id_seq OWNER TO postgres;

--
-- Name: gallery_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.gallery_id_seq OWNED BY public.gallery.id;


--
-- Name: meme; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.meme (
    id integer NOT NULL,
    title character varying NOT NULL,
    image_url character varying NOT NULL,
    description character varying,
    likes_count integer NOT NULL,
    created_at timestamp without time zone NOT NULL,
    user_id integer NOT NULL
);


ALTER TABLE public.meme OWNER TO postgres;

--
-- Name: meme_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.meme_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.meme_id_seq OWNER TO postgres;

--
-- Name: meme_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.meme_id_seq OWNED BY public.meme.id;


--
-- Name: memegallerylink; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.memegallerylink (
    gallery_id integer NOT NULL,
    meme_id integer NOT NULL
);


ALTER TABLE public.memegallerylink OWNER TO postgres;

--
-- Name: memelike; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.memelike (
    user_id integer NOT NULL,
    meme_id integer NOT NULL,
    created_at timestamp without time zone NOT NULL
);


ALTER TABLE public.memelike OWNER TO postgres;

--
-- Name: memetaglink; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.memetaglink (
    meme_id integer NOT NULL,
    tag_id integer NOT NULL
);


ALTER TABLE public.memetaglink OWNER TO postgres;

--
-- Name: post; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.post (
    id integer NOT NULL,
    title character varying NOT NULL,
    content character varying NOT NULL,
    is_anonymous boolean NOT NULL,
    image_url character varying,
    created_at timestamp without time zone NOT NULL,
    user_id integer NOT NULL
);


ALTER TABLE public.post OWNER TO postgres;

--
-- Name: post_comment; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.post_comment (
    id integer NOT NULL,
    content character varying NOT NULL,
    is_anonymous boolean NOT NULL,
    created_at timestamp without time zone NOT NULL,
    user_id integer NOT NULL,
    post_id integer NOT NULL
);


ALTER TABLE public.post_comment OWNER TO postgres;

--
-- Name: post_comment_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.post_comment_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.post_comment_id_seq OWNER TO postgres;

--
-- Name: post_comment_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.post_comment_id_seq OWNED BY public.post_comment.id;


--
-- Name: post_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.post_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.post_id_seq OWNER TO postgres;

--
-- Name: post_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.post_id_seq OWNED BY public.post.id;


--
-- Name: tag; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tag (
    id integer NOT NULL,
    name character varying NOT NULL
);


ALTER TABLE public.tag OWNER TO postgres;

--
-- Name: tag_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.tag_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.tag_id_seq OWNER TO postgres;

--
-- Name: tag_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tag_id_seq OWNED BY public.tag.id;


--
-- Name: user; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."user" (
    id integer NOT NULL,
    email character varying NOT NULL,
    username character varying NOT NULL,
    hashed_password character varying NOT NULL,
    avatar_url character varying,
    bio character varying,
    likes_received character varying NOT NULL,
    followers_count integer NOT NULL,
    following_count integer NOT NULL,
    status_message character varying
);


ALTER TABLE public."user" OWNER TO postgres;

--
-- Name: user_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.user_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.user_id_seq OWNER TO postgres;

--
-- Name: user_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.user_id_seq OWNED BY public."user".id;


--
-- Name: gallery id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gallery ALTER COLUMN id SET DEFAULT nextval('public.gallery_id_seq'::regclass);


--
-- Name: meme id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.meme ALTER COLUMN id SET DEFAULT nextval('public.meme_id_seq'::regclass);


--
-- Name: post id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.post ALTER COLUMN id SET DEFAULT nextval('public.post_id_seq'::regclass);


--
-- Name: post_comment id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.post_comment ALTER COLUMN id SET DEFAULT nextval('public.post_comment_id_seq'::regclass);


--
-- Name: tag id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tag ALTER COLUMN id SET DEFAULT nextval('public.tag_id_seq'::regclass);


--
-- Name: user id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."user" ALTER COLUMN id SET DEFAULT nextval('public.user_id_seq'::regclass);


--
-- Data for Name: gallery; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.gallery (id, name, description, created_at, user_id) FROM stdin;
1	테스트 갤러리	갤러리 생성 테스트	2026-04-10 08:36:06.548853	2
2	개웃겨		2026-04-10 08:37:31.199435	2
3	개웃겨		2026-04-10 08:37:42.006937	2
4	밈카드	\N	2026-04-12 10:42:37.552385	2
\.


--
-- Data for Name: meme; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.meme (id, title, image_url, description, likes_count, created_at, user_id) FROM stdin;
1	저를 깨우지 말아주세요	https://storage.googleapis.com/memit-bucket-yay/uploads/e63022048b554ac48d3de2667bb78297.jpg	\N	1	2026-04-10 08:37:21.308871	2
2	22살	https://storage.googleapis.com/memit-bucket-yay/uploads/5acdace76a6541858d29875e16146236.jpg	22살이면...	1	2026-04-10 10:16:02.076073	2
3	하하엄마처럼 하하하	https://storage.googleapis.com/memit-bucket-yay/uploads/b94e225d330247cf8bac926a19dbb19c.jpg	하하엄마처럼 하하하	1	2026-04-11 05:43:26.751379	2
52	holy shit	https://storage.googleapis.com/memit-bucket-yay/uploads/930dfceba2594843adfbc62d188344d8.jpg		0	2026-04-11 05:45:50.788864	2
56	임영웅	https://storage.googleapis.com/memit-bucket-yay/uploads/25b0413ce7fe44cd9d056827af83c6e7.jpg		0	2026-04-11 05:45:50.901027	2
57	모릅니다	https://storage.googleapis.com/memit-bucket-yay/uploads/b438cc7f02014b18b1b90da082589640.jpg		0	2026-04-11 05:45:50.927244	2
91	빨리 낫기	https://storage.googleapis.com/memit-bucket-yay/uploads/94c8c6ba8c5b8169b3ba1e8296165b2c.jpg		0	2026-04-12 08:54:29.942747	2
143	이미 다니고 있어 정신과.	https://storage.googleapis.com/memit-bucket-yay/uploads/13774ae9c3f39126362935a9f84b327a.jpg		0	2026-04-12 10:42:37.559667	2
173	등장 지렸누	https://storage.googleapis.com/memit-bucket-yay/uploads/ad0a9ed4df924eea7e3b5a2619b9df95.jpg		0	2026-04-12 10:42:37.612757	2
174	모든 여자애들이 얼굴을 붉히기 시작하	https://storage.googleapis.com/memit-bucket-yay/uploads/af25149b51fb65bc1ecf07107a3f77c5.jpg		0	2026-04-12 10:42:37.614425	2
175	꺄아아아아아	https://storage.googleapis.com/memit-bucket-yay/uploads/b53ee9467b1dbb2392339c2148153b90.jpg		0	2026-04-12 10:42:37.616169	2
4	INTP 이안시누	https://storage.googleapis.com/memit-bucket-yay/uploads/c5f8949b276841399d7a820b31100977.jpg		0	2026-04-11 05:45:49.754359	2
5	윤남노	https://storage.googleapis.com/memit-bucket-yay/uploads/70c879dca4d64b4c9833ef24fee45de5.jpg		1	2026-04-11 05:45:49.778284	2
6	소화 해야되니까 가만히 앉아 있어 볼게요...	https://storage.googleapis.com/memit-bucket-yay/uploads/86cecb2408ed441a87702cf3a11e3734.jpg		0	2026-04-11 05:45:49.793281	2
7	몸은 팔팔 돈은 빌빌	https://storage.googleapis.com/memit-bucket-yay/uploads/0c9f8e0fa344493c99fe1db3ae300287.jpg		0	2026-04-11 05:45:49.80614	2
144	감히 다른 사람의 페로몬을 묻히고 오다니	https://storage.googleapis.com/memit-bucket-yay/uploads/169b3afec8e9874cf4860dd6f73f646d.jpg		0	2026-04-12 10:42:37.561427	2
145	음란하고 살찐 돼지야	https://storage.googleapis.com/memit-bucket-yay/uploads/26a4a9148eeaef147f44131edbeb351c.jpg		0	2026-04-12 10:42:37.564193	2
146	카광	https://storage.googleapis.com/memit-bucket-yay/uploads/28a7b5c92e7b04d675aa113f18d4b637.jpg		0	2026-04-12 10:42:37.565761	2
147	배터리가 부족하여 전원이 꺼집니다	https://storage.googleapis.com/memit-bucket-yay/uploads/2c4353e97a9accf9871c6c7188042c78.jpg		0	2026-04-12 10:42:37.567501	2
148	이재용 쉿	https://storage.googleapis.com/memit-bucket-yay/uploads/3156ddb5fdaa1abb10c731b357d6b968.jpg		0	2026-04-12 10:42:37.569349	2
149	김기수	https://storage.googleapis.com/memit-bucket-yay/uploads/3fddecd625a05e9be6e819fb96ce3144.jpg		0	2026-04-12 10:42:37.572782	2
150	많이 못 먹어요	https://storage.googleapis.com/memit-bucket-yay/uploads/4b122dcaa13ec7547496ab8325bdaf62.jpg		0	2026-04-12 10:42:37.57453	2
151	나는 짐승 합격	https://storage.googleapis.com/memit-bucket-yay/uploads/5301171c921dc862a35c55821db73905.jpg		0	2026-04-12 10:42:37.576087	2
152	새장 속에 갇힌 새	https://storage.googleapis.com/memit-bucket-yay/uploads/5aaae69375728f97f385b86cd1efda5a.jpg		0	2026-04-12 10:42:37.577652	2
153	나 너 밥 사줄 돈 정돈 있어.	https://storage.googleapis.com/memit-bucket-yay/uploads/5c8e08be5a56bfa1a9c26a565b9afdcf.jpg		0	2026-04-12 10:42:37.579568	2
154	대학이 뭐라고 우리 사이를 존x 갈라놔.	https://storage.googleapis.com/memit-bucket-yay/uploads/5d73adda361bda4c35977843e69ffa66.jpg		0	2026-04-12 10:42:37.58111	2
155	약	https://storage.googleapis.com/memit-bucket-yay/uploads/66575cb418c2f0e3efd8816e591f34c8.jpg		0	2026-04-12 10:42:37.582757	2
156	타락천사의 재판	https://storage.googleapis.com/memit-bucket-yay/uploads/68fcd81cbd6806d43d490c3b5880306d.jpg		0	2026-04-12 10:42:37.584371	2
157	팔리아치	https://storage.googleapis.com/memit-bucket-yay/uploads/6d8c1262cc47139131db00da5cb2b321.jpg		0	2026-04-12 10:42:37.586209	2
158	슝슝 원본	https://storage.googleapis.com/memit-bucket-yay/uploads/6e84b26c9c784c204428a1583b415ef6.jpg		0	2026-04-12 10:42:37.587868	2
159	좋은느낌	https://storage.googleapis.com/memit-bucket-yay/uploads/6f40cde576612ff2edcbfe02ffa9f7f7.jpg		0	2026-04-12 10:42:37.589491	2
160	가족이 되주라 내 집이 되주라	https://storage.googleapis.com/memit-bucket-yay/uploads/6fc6b8098e6b45d8093e1533b95d5c14.jpg		0	2026-04-12 10:42:37.59109	2
161	엄마 아빠 사랑해요	https://storage.googleapis.com/memit-bucket-yay/uploads/70412521f120ce741971afc90e0fd876.jpg		0	2026-04-12 10:42:37.592939	2
162	슝슝 ~~~	https://storage.googleapis.com/memit-bucket-yay/uploads/7904bde477b4b80a7b81db4940ccfaad.jpg		0	2026-04-12 10:42:37.594675	2
163	you 엉덩이 is 달콤달콤	https://storage.googleapis.com/memit-bucket-yay/uploads/7c4865a7fa5863d8c799b84719770321.jpg		0	2026-04-12 10:42:37.596139	2
164	백진희	https://storage.googleapis.com/memit-bucket-yay/uploads/8bf3d29bc784c758b0b665819153a293.jpg		0	2026-04-12 10:42:37.597835	2
165	어른씨	https://storage.googleapis.com/memit-bucket-yay/uploads/8bfda9ed777edeb94d57d3dbab091d34.jpg		0	2026-04-12 10:42:37.599523	2
166	나 치매인가봐 행복한 기억이 없어	https://storage.googleapis.com/memit-bucket-yay/uploads/91c89fc3f574e77cc66a88468db7ed49.jpg		0	2026-04-12 10:42:37.601256	2
167	눈물	https://storage.googleapis.com/memit-bucket-yay/uploads/93ad5c640b5296a8b148095e6f3a13fc.jpg		0	2026-04-12 10:42:37.602982	2
168	배고플 나이	https://storage.googleapis.com/memit-bucket-yay/uploads/960b193c8f2aa0a6c7c3e260aafdc619.jpg		0	2026-04-12 10:42:37.604449	2
169	나에겐 더 이상 정신질환이 없다	https://storage.googleapis.com/memit-bucket-yay/uploads/9bc981d279ea5394f0ed2239d6754c22.jpg		0	2026-04-12 10:42:37.606096	2
170	임영웅 뱀파이어	https://storage.googleapis.com/memit-bucket-yay/uploads/9cab260683b8d9553e9f91134af23416.jpg		0	2026-04-12 10:42:37.607857	2
171	최저시급 200만원	https://storage.googleapis.com/memit-bucket-yay/uploads/9f04d44e647ea7f716998d2cf77ce020.jpg		0	2026-04-12 10:42:37.609584	2
172	도도도도	https://storage.googleapis.com/memit-bucket-yay/uploads/9f178bd3afcbc84e2558d68717b2d493.jpg		0	2026-04-12 10:42:37.611105	2
176	제가 그 팔리아치입니다	https://storage.googleapis.com/memit-bucket-yay/uploads/b9ff336b8da2b367aeccc75985036609.jpg		0	2026-04-12 10:42:37.618099	2
177	뚜웅	https://storage.googleapis.com/memit-bucket-yay/uploads/bcfd760a38f9345c6a82bb5f69a7b640.jpg		0	2026-04-12 10:42:37.62041	2
178	타케미치 눈물	https://storage.googleapis.com/memit-bucket-yay/uploads/c126de72b6be43b18bc053053729ee42.jpg		0	2026-04-12 10:42:37.622291	2
179	배불띠	https://storage.googleapis.com/memit-bucket-yay/uploads/d78bf359e13cc1f65402e165cebf290e.jpg		0	2026-04-12 10:42:37.624234	2
180	마루머쓱	https://storage.googleapis.com/memit-bucket-yay/uploads/ddcbe65cdeabab14659e30e45e5379dc.jpg		0	2026-04-12 10:42:37.625985	2
181	깨우지 말라고...	https://storage.googleapis.com/memit-bucket-yay/uploads/df05bee73c77f04e36058bd41749bd8f.jpg		1	2026-04-12 10:42:37.62785	2
182	41	https://storage.googleapis.com/memit-bucket-yay/uploads/e811397c35b40a48cfff6acb8ae27c09.jpg	\N	0	2026-04-12 10:42:37.629547	2
183	그래 이 맛이지	https://storage.googleapis.com/memit-bucket-yay/uploads/eacd89ebb4480d271c9d973b944fc0fc.jpg		0	2026-04-12 10:42:37.631438	2
184	다죽자 월드	https://storage.googleapis.com/memit-bucket-yay/uploads/ecf2a7ecf66671ac8b0bd2e7e8443ed1.jpg		0	2026-04-12 10:42:37.633031	2
185	Me now	https://storage.googleapis.com/memit-bucket-yay/uploads/f2f2935c493eecb20e1ba0d15e91956e.jpg		0	2026-04-12 10:42:37.63508	2
186	나 왜 이렇게 많이 먹지?	https://storage.googleapis.com/memit-bucket-yay/uploads/f5aa6fff4d98ef3680cbdad368090985.jpg		0	2026-04-12 10:42:37.636704	2
187	할렐야루	https://storage.googleapis.com/memit-bucket-yay/uploads/할렐야루.jpg		0	2026-04-12 10:42:37.638616	2
15	배우고 갑니다	https://storage.googleapis.com/memit-bucket-yay/uploads/f57904b522fa4b638542e3c15ad58bfe.jpg		0	2026-04-11 05:45:49.909479	2
9	맹	https://storage.googleapis.com/memit-bucket-yay/uploads/e9123e10f3964d9b972b698d2d8914b1.jpg		0	2026-04-11 05:45:49.832921	2
10	폭스클럽 폭소	https://storage.googleapis.com/memit-bucket-yay/uploads/a612cabedef74fc89aadf7947e11d53f.jpg		0	2026-04-11 05:45:49.844139	2
11	먹봇, 시스템 종료.	https://storage.googleapis.com/memit-bucket-yay/uploads/db844026790b410a83e660606c885087.jpg		0	2026-04-11 05:45:49.855005	2
13	장다아 담배	https://storage.googleapis.com/memit-bucket-yay/uploads/8811b2588b59437abcd1603cc700c81d.jpg		0	2026-04-11 05:45:49.881413	2
14	박연진	https://storage.googleapis.com/memit-bucket-yay/uploads/cef5736318574d8eaf5eaa178877e29a.jpg		0	2026-04-11 05:45:49.894465	2
16	찰스엔터 줌수업	https://storage.googleapis.com/memit-bucket-yay/uploads/aa8acc5a4c894e0b8d0ed39ac6d3d850.jpg		0	2026-04-11 05:45:49.921421	2
17	신지	https://storage.googleapis.com/memit-bucket-yay/uploads/b777741f1e9e411aab52d02d4d63236d.jpg		0	2026-04-11 05:45:49.933504	2
18	이안시누 많이 피곤해?	https://storage.googleapis.com/memit-bucket-yay/uploads/065cd6958f1644f7adfb4ca1fcdb2729.jpg		0	2026-04-11 05:45:49.944232	2
19	이안시누	https://storage.googleapis.com/memit-bucket-yay/uploads/15606cc0294b44c3980bfae67277a467.jpg		0	2026-04-11 05:45:49.957537	2
20	불결해 어른	https://storage.googleapis.com/memit-bucket-yay/uploads/e76468c1a4c9479cb25353d1f1f38a5a.jpg		0	2026-04-11 05:45:49.970519	2
23	내가 불편하딘면. 블언블을부탁할께.	https://storage.googleapis.com/memit-bucket-yay/uploads/83e43fe04a8f424caa525820ad7aec3e.jpg		0	2026-04-11 05:45:50.014794	2
24	나는 22살에 인생을 걸었다	https://storage.googleapis.com/memit-bucket-yay/uploads/e11a3ad394224582bdc8e21451384cfc.jpg		0	2026-04-11 05:45:50.030228	2
30	앙기모찌 1조	https://storage.googleapis.com/memit-bucket-yay/uploads/a72ec7f76fe44fcda11d50fd36eece53.jpg		0	2026-04-11 05:45:50.169075	2
33	와이건참지	https://storage.googleapis.com/memit-bucket-yay/uploads/d06dcfe9d4944580979e1035095d3080.jpg		0	2026-04-11 05:45:50.285707	2
34	손흥민	https://storage.googleapis.com/memit-bucket-yay/uploads/abb5f32939c841e79eebf988acaccf60.jpg		0	2026-04-11 05:45:50.308222	2
36	이은지 데헷	https://storage.googleapis.com/memit-bucket-yay/uploads/485d94b2800947698045cd87a557cbee.jpg		0	2026-04-11 05:45:50.350004	2
38	개미친놈 민증	https://storage.googleapis.com/memit-bucket-yay/uploads/7a367ddb396d4f40b8c286e58dc69bb1.jpg		0	2026-04-11 05:45:50.395025	2
39	강다니엘 이모	https://storage.googleapis.com/memit-bucket-yay/uploads/a64cd23519e542fbab5072fb5de71062.jpg		0	2026-04-11 05:45:50.417465	2
40	전진 어리둥절	https://storage.googleapis.com/memit-bucket-yay/uploads/f4d80e426e8c481aa6dacfc95292cef1.jpg		0	2026-04-11 05:45:50.44584	2
41	엉덩이	https://storage.googleapis.com/memit-bucket-yay/uploads/82ae30342386453c915137c5f484cffd.png		0	2026-04-11 05:45:50.479483	2
42	문희준	https://storage.googleapis.com/memit-bucket-yay/uploads/315aa9195122404f967198aa437fc14f.jpg		0	2026-04-11 05:45:50.506084	2
44	주우재	https://storage.googleapis.com/memit-bucket-yay/uploads/f89c4767541649fa8c83fd295ed24976.jpg		1	2026-04-11 05:45:50.55561	2
45	비정상과 이안시누	https://storage.googleapis.com/memit-bucket-yay/uploads/2f91d92167d94f1c9b82d11b9a8fd71a.jpg		0	2026-04-11 05:45:50.579399	2
48	내마음	https://storage.googleapis.com/memit-bucket-yay/uploads/0509310aa8fb404cb2f6c47b76adbe6a.png		0	2026-04-11 05:45:50.663062	2
49	프듀 소주	https://storage.googleapis.com/memit-bucket-yay/uploads/cc62f064efbf43d6bf3e7f6978842fd8.jpg		0	2026-04-11 05:45:50.693043	2
46	오빠 나 어떻해...	https://storage.googleapis.com/memit-bucket-yay/uploads/08b093ee45da40d192caf18b5cc01683.png		0	2026-04-11 05:45:50.611752	2
51	와 행복하다	https://storage.googleapis.com/memit-bucket-yay/uploads/d5679d0b5c724255afeba75bf4f23fe2.jpg		1	2026-04-11 05:45:50.758524	2
61	먹느라 영화의 흐름을 하나도 못 잡았어요.....	https://storage.googleapis.com/memit-bucket-yay/uploads/e7c94ae2b7144978b98ea4c8c1dea16d.jpg		0	2026-04-11 05:45:51.044027	2
63	젠장... 내가 우나 봐라!	https://storage.googleapis.com/memit-bucket-yay/uploads/d456f7957b404d2da6653d29d12c95d0.JPG		0	2026-04-11 05:45:51.097833	2
64	동대문 엽기 떡볶이 파티	https://storage.googleapis.com/memit-bucket-yay/uploads/58a523940da94728be517b84aa471937.jpg		0	2026-04-11 05:45:51.12604	2
66	깔끔하고 예뻐진 꾸릉이	https://storage.googleapis.com/memit-bucket-yay/uploads/072fb531b69ad55af9fb6cf3f6ab9023.jpg		0	2026-04-12 08:54:29.922171	2
68	현우진 사교육 추방	https://storage.googleapis.com/memit-bucket-yay/uploads/103d4b7a067634c65050b83d483cc89b.jpg		0	2026-04-12 08:54:29.923368	2
69	JoA	https://storage.googleapis.com/memit-bucket-yay/uploads/1049fbe1977e294f1a8e8ec0da0f7514.jpg		0	2026-04-12 08:54:29.924039	2
89	뭔가 재미있는 일 없으려나	https://storage.googleapis.com/memit-bucket-yay/uploads/83ecbef7f70f900d6d750894d6334b68.jpg		0	2026-04-12 08:54:29.940751	2
90	죽자... 나의 의지로.	https://storage.googleapis.com/memit-bucket-yay/uploads/900＿20241010＿000116.jpg		0	2026-04-12 08:54:29.941957	2
92	22살	https://storage.googleapis.com/memit-bucket-yay/uploads/96cc4d18f9fe77af53da7d373cdecee5.jpg		0	2026-04-12 08:54:29.943438	2
99	다잘될거야...	https://storage.googleapis.com/memit-bucket-yay/uploads/IMG_0182.png		0	2026-04-12 08:54:29.964414	2
102	나 따위가 좋아하는 것 자체가 죄이겠지요	https://storage.googleapis.com/memit-bucket-yay/uploads/IMG_4203.jpg		0	2026-04-12 08:54:29.971672	2
107	뒤로 브이	https://storage.googleapis.com/memit-bucket-yay/uploads/a5a4bd2359ce1843642e3f120bc4542d.jpg		0	2026-04-12 08:54:29.981631	2
122	송민호	https://storage.googleapis.com/memit-bucket-yay/uploads/eeda0aa1d8c875f76190a7caa544d352.jpg		0	2026-04-12 08:54:29.99231	2
125	겉으론 밝은척 속으론 울고있다	https://storage.googleapis.com/memit-bucket-yay/uploads/meme_ani.png		0	2026-04-12 08:54:29.994412	2
126	신지	https://storage.googleapis.com/memit-bucket-yay/uploads/meme_eva.png		0	2026-04-12 08:54:29.995681	2
127	아임피네	https://storage.googleapis.com/memit-bucket-yay/uploads/meme_fine.png		0	2026-04-12 08:54:29.996468	2
128	I'm Haha	https://storage.googleapis.com/memit-bucket-yay/uploads/meme_haha.jpg		0	2026-04-12 08:54:29.997522	2
130	I'm fighting Gold	https://storage.googleapis.com/memit-bucket-yay/uploads/meme_jojo.png		0	2026-04-12 08:54:29.99881	2
133	그만두고 싶어	https://storage.googleapis.com/memit-bucket-yay/uploads/meme_mandu.png		0	2026-04-12 08:54:30.004363	2
136	제가 그 팔리아치입니다	https://storage.googleapis.com/memit-bucket-yay/uploads/meme_pagliacci.JPG		0	2026-04-12 08:54:30.009913	2
138	I'm Pani	https://storage.googleapis.com/memit-bucket-yay/uploads/meme_pani.png		0	2026-04-12 08:54:30.012849	2
139	배로 테이블 치지 마세요	https://storage.googleapis.com/memit-bucket-yay/uploads/meme_table.jpg		0	2026-04-12 08:54:30.013884	2
\.


--
-- Data for Name: memegallerylink; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.memegallerylink (gallery_id, meme_id) FROM stdin;
2	57
1	133
4	143
4	144
4	145
4	146
4	147
4	148
4	149
4	150
4	151
4	152
4	153
4	154
4	155
4	156
4	157
4	158
4	159
4	160
4	161
4	162
4	163
4	164
4	165
4	166
4	167
4	168
4	169
4	170
4	171
4	172
4	173
4	174
4	175
4	176
4	177
4	178
4	179
4	180
4	181
4	182
4	183
4	184
4	185
4	186
4	187
\.


--
-- Data for Name: memelike; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.memelike (user_id, meme_id, created_at) FROM stdin;
2	3	2026-04-11 05:43:29.460255
2	2	2026-04-11 05:43:30.250016
2	51	2026-04-12 08:42:11.878529
2	5	2026-04-12 09:56:11.00287
2	44	2026-04-12 09:56:18.7182
2	1	2026-04-12 09:56:23.37416
2	181	2026-04-13 08:10:41.959782
\.


--
-- Data for Name: memetaglink; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.memetaglink (meme_id, tag_id) FROM stdin;
1	1
1	2
2	3
2	4
2	5
3	6
3	7
3	8
46	9
46	10
133	15
133	16
133	17
133	18
126	19
126	20
125	21
125	22
125	23
125	24
136	1
122	34
122	35
122	36
122	37
128	39
128	9
128	6
128	7
128	40
139	48
139	49
139	50
91	51
69	56
69	57
69	58
68	59
68	60
68	61
30	62
30	63
30	64
66	65
66	66
102	67
102	68
102	49
102	48
99	69
61	70
61	71
61	72
61	73
64	75
64	76
64	77
64	78
63	79
63	80
63	81
107	82
107	83
107	84
107	18
107	85
107	86
92	90
57	91
57	92
57	93
57	94
56	95
56	96
56	97
19	42
19	98
33	102
33	103
34	104
34	105
34	106
24	3
24	112
23	113
23	114
23	115
23	116
20	117
20	118
20	119
18	42
44	120
44	121
42	87
42	88
42	89
16	122
16	123
16	124
16	125
17	126
17	20
17	19
17	127
15	45
15	46
15	128
41	55
41	52
41	53
40	109
40	111
40	129
40	130
39	131
39	132
39	133
38	101
38	99
38	2
13	134
13	135
13	136
11	137
11	138
11	139
11	140
10	141
10	142
10	143
36	144
36	145
9	146
9	147
9	148
7	118
7	119
7	149
7	150
6	70
6	151
6	140
52	32
52	30
52	33
51	152
51	44
49	153
49	154
49	155
49	156
45	42
45	43
45	44
4	161
4	162
48	12
48	163
143	164
143	165
154	166
154	167
166	1
166	168
166	169
178	170
178	171
180	173
180	174
168	39
168	175
168	176
167	177
167	178
167	179
167	169
160	180
159	181
159	182
159	183
186	184
185	185
185	186
158	187
157	188
157	189
157	190
184	57
184	191
156	192
156	193
156	194
156	195
183	196
183	197
155	198
155	199
181	1
153	200
153	189
153	201
153	202
179	140
179	203
179	204
179	185
151	205
151	206
151	207
151	208
150	175
150	209
150	39
150	6
150	210
150	185
150	211
177	49
177	48
177	211
176	1
176	212
176	213
176	214
149	215
149	216
149	217
175	218
175	219
175	220
174	221
174	222
147	1
146	223
146	224
146	225
146	226
14	227
14	228
14	229
14	230
172	49
172	48
172	231
145	11
145	232
144	233
144	234
144	235
171	236
170	237
170	238
170	239
5	240
5	241
5	242
165	243
164	244
163	245
163	246
161	247
161	248
161	249
138	22
138	25
138	26
138	250
130	27
130	28
130	29
130	22
130	250
\.


--
-- Data for Name: post; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.post (id, title, content, is_anonymous, image_url, created_at, user_id) FROM stdin;
1	야호	첫번째 글	f	\N	2026-04-13 08:31:21.855936	2
\.


--
-- Data for Name: post_comment; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.post_comment (id, content, is_anonymous, created_at, user_id, post_id) FROM stdin;
\.


--
-- Data for Name: tag; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tag (id, name) FROM stdin;
1	팔리아치
2	릴스
3	22살
4	공감짤
5	짤
6	무한도전
7	하하
8	하하엄마
9	웃긴짤
10	슈게임
11	정재형
12	피식대학
13	내마음
14	뭘까
15	연애혁명
16	공주영
17	그만두고싶어
18	퇴사짤
19	에반게리온
20	신지
21	겉바속촉
22	아임피네
23	감성짤
24	감성
25	파니팡
26	아임파니
27	죠죠짤
28	죠죠
29	아임죠죠
30	주둥이
31	유튜버
32	홀리쓋
33	뒷목
34	송민호
35	달바
36	갈건데
37	어디로가면되노
38	#오빠나어떻해 #슈게임
39	무도짤
40	아임하하
41	오빠나어떻해
42	이안시누
43	비정상
44	행복
45	칸예
46	칸예짤
47	배우고갑니다
48	프리드로우
49	동까
50	인생존망
51	빨리낫는법
52	외지주
53	외모지상주의
54	자신있는부위
55	엉덩이
56	joa
57	유재석
58	보아
59	현우진
60	사교육
61	추방
62	앙기모찌
63	1조
64	공대생
65	깔예꾸
66	꾸릉이
67	안경
68	자물쇠안경
69	다잘될거야
70	레이
71	먹느라
72	영화
73	실수
74	하하하
75	엽떡파티
76	엽떡
77	엽기떡볶이
78	마이린
79	동숲
80	동물의숲
81	동숲짤
82	직장인
83	직장인짤
84	퇴사
85	바비
86	인형
87	문희준
88	런닝맨
89	충격
90	2살
91	몰루
92	모릅니다
93	모름
94	몰라요
95	임영웅
96	섹시
97	넥타이
98	부끄러움
99	예예
100	개미친놈
101	민증
102	카카오톡
103	카카오프렌즈
104	손흥민
105	웃음
106	웃는짤
107	성격교정
108	불가
109	전진
110	자다깬짤
111	엥
112	스물두살
113	블언블
114	코마에다
115	단간론파
116	단간
117	불결해
118	카구라
119	은혼
120	주우재
121	침착맨
122	줌
123	찰스엔터
124	줌수업
125	안젤리나
126	공허
127	에바짤
128	배우신분
129	어리둥절
130	인터뷰
131	조현병
132	강다니엘
133	강다니엘이모
134	장다아
135	담배
136	현타
137	제리얌
138	먹봇
139	배부를때
140	배부름
141	폭소
142	개웃김
143	개웃겨
144	민망
145	헤헷
146	자다깸
147	헐
148	어이없음
149	은혼짤
150	젊음
151	소화
152	정상수
153	프듀
154	소주
155	힘들다
156	내힘들다
161	사실이잖아
162	intp
163	but
164	똑닮은딸
165	정신과
166	지현호
167	일진에게찍혔을때
168	치매
169	우울
170	도리벤
171	도쿄리벤져스
172	타케미치
173	마루머쓱
174	마루쫑쫑
175	무한상사
176	무한상사짤
181	좋느를줌
182	좋느
183	느좋
177	오덕
178	안여돼
179	눈물
180	가족이돼주라
184	황은정
185	다이어트
186	살찜
187	슝슝
188	오열
189	돈
190	돈짤
191	메뚜기월드
192	타락천사
193	쥬니어네이버
194	옷입히기
195	옷입히기게임
196	일당
197	민수오빠
198	아플때
199	아픔
200	그정도만있다
201	거지짤
202	거지
203	배불띠
204	이수근
205	긍정화법
206	부정화법
207	다자이오사무
208	디제이오사무
209	무도
210	정준하
211	돼지
212	쟝
213	진격의거인
214	진격거
215	김기수
216	개강메이크업
217	메이크업
218	정신병
219	랑데뷰
220	소연
221	오타쿠
222	인기남
223	꾸몄음
224	꾸밈
225	지하철
226	공작새
227	연진아
228	연진이
229	교도소
230	수감짤
231	졸귀
232	요정재형
233	집착광공
234	광공
235	집착
236	이백만원
237	드라큘라
238	은발
239	적안
240	요똘
241	요리하는또라이
242	흑백요리사
243	아이씨
244	사시
245	문자
246	카톡짤
247	효도
248	문신
249	타투
250	아임파인
\.


--
-- Data for Name: user; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."user" (id, email, username, hashed_password, avatar_url, bio, likes_received, followers_count, following_count, status_message) FROM stdin;
1	test@example.com	testuser	$2b$12$xBnLk.DlFdAlPt3N0rC6Vunv4N4LlqgjsY.yv/sVyDpktTOcnlkd.	\N	\N	0	0	0	\N
3	uploader@memit.com	uploader	$2b$12$Dj6iXZB8qKpKSGU3xKmFne4qUfMb.0gsHH1040JCYHplKdpj2dNU6	\N	\N	0	0	0	\N
2	dev@memit.com	devuser	$2b$12$R3vOvFveE1LIqw5Xd201Cey1fsqRVms8BayDXhxg2ENH5Ls/FavRC	https://storage.googleapis.com/memit-bucket-yay/avatars/avatar_2_2cc3f293.jpg	밈잘알 개발자입니다	0	0	0	코딩중 🛠️
\.


--
-- Name: gallery_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.gallery_id_seq', 4, true);


--
-- Name: meme_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.meme_id_seq', 187, true);


--
-- Name: post_comment_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.post_comment_id_seq', 1, false);


--
-- Name: post_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.post_id_seq', 1, true);


--
-- Name: tag_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.tag_id_seq', 250, true);


--
-- Name: user_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.user_id_seq', 3, true);


--
-- Name: gallery gallery_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gallery
    ADD CONSTRAINT gallery_pkey PRIMARY KEY (id);


--
-- Name: meme meme_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.meme
    ADD CONSTRAINT meme_pkey PRIMARY KEY (id);


--
-- Name: memegallerylink memegallerylink_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.memegallerylink
    ADD CONSTRAINT memegallerylink_pkey PRIMARY KEY (gallery_id, meme_id);


--
-- Name: memelike memelike_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.memelike
    ADD CONSTRAINT memelike_pkey PRIMARY KEY (user_id, meme_id);


--
-- Name: memetaglink memetaglink_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.memetaglink
    ADD CONSTRAINT memetaglink_pkey PRIMARY KEY (meme_id, tag_id);


--
-- Name: post_comment post_comment_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.post_comment
    ADD CONSTRAINT post_comment_pkey PRIMARY KEY (id);


--
-- Name: post post_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.post
    ADD CONSTRAINT post_pkey PRIMARY KEY (id);


--
-- Name: tag tag_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tag
    ADD CONSTRAINT tag_pkey PRIMARY KEY (id);


--
-- Name: user user_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT user_pkey PRIMARY KEY (id);


--
-- Name: ix_tag_name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX ix_tag_name ON public.tag USING btree (name);


--
-- Name: ix_user_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX ix_user_email ON public."user" USING btree (email);


--
-- Name: ix_user_username; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX ix_user_username ON public."user" USING btree (username);


--
-- Name: gallery gallery_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gallery
    ADD CONSTRAINT gallery_user_id_fkey FOREIGN KEY (user_id) REFERENCES public."user"(id);


--
-- Name: meme meme_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.meme
    ADD CONSTRAINT meme_user_id_fkey FOREIGN KEY (user_id) REFERENCES public."user"(id);


--
-- Name: memegallerylink memegallerylink_gallery_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.memegallerylink
    ADD CONSTRAINT memegallerylink_gallery_id_fkey FOREIGN KEY (gallery_id) REFERENCES public.gallery(id);


--
-- Name: memegallerylink memegallerylink_meme_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.memegallerylink
    ADD CONSTRAINT memegallerylink_meme_id_fkey FOREIGN KEY (meme_id) REFERENCES public.meme(id);


--
-- Name: memelike memelike_meme_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.memelike
    ADD CONSTRAINT memelike_meme_id_fkey FOREIGN KEY (meme_id) REFERENCES public.meme(id);


--
-- Name: memelike memelike_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.memelike
    ADD CONSTRAINT memelike_user_id_fkey FOREIGN KEY (user_id) REFERENCES public."user"(id);


--
-- Name: memetaglink memetaglink_meme_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.memetaglink
    ADD CONSTRAINT memetaglink_meme_id_fkey FOREIGN KEY (meme_id) REFERENCES public.meme(id);


--
-- Name: memetaglink memetaglink_tag_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.memetaglink
    ADD CONSTRAINT memetaglink_tag_id_fkey FOREIGN KEY (tag_id) REFERENCES public.tag(id);


--
-- Name: post_comment post_comment_post_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.post_comment
    ADD CONSTRAINT post_comment_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.post(id);


--
-- Name: post_comment post_comment_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.post_comment
    ADD CONSTRAINT post_comment_user_id_fkey FOREIGN KEY (user_id) REFERENCES public."user"(id);


--
-- Name: post post_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.post
    ADD CONSTRAINT post_user_id_fkey FOREIGN KEY (user_id) REFERENCES public."user"(id);


--
-- PostgreSQL database dump complete
--

\unrestrict iVY9Bo8YwFEHIlQtIjMssKtQmU2rZvdHXCgW9W3lO9qMtN4XpuGxtO71oPecJ7z

