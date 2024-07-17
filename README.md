# 산들바람
---

![Untitled](https://prod-files-secure.s3.us-west-2.amazonaws.com/f6cb388f-3934-47d6-9928-26d2e10eb0fc/b667e494-3dc5-4ab5-a4e0-2b982bc7698f/Untitled.png)
**맥락 의존 기억,** 특정 소리가 있는 환경에서 학습한 정보는 나중에 같은 소리가 있는 환경에서 더 잘 기억될 수 있습니다. 
**산들바람**은 당신의 귀중한 자산인 **추억**과 어울리는 **음악**을 함께 저장하고, 소리와 함께 새겨진 추억을 다시 꺼내볼 수 있도록 도와줍니다.


# Team

최정민

카이스트 수리과학과 22학번

[madcampnewbie - Overview](https://github.com/madcampnewbie)

하도현

카이스트 전산학부 22학번

[hado68 - Overview](https://github.com/hado68)

# Stack

---

- **Framework**: Next.js, Flask
- **Database**: MongoDB
- **Authentication**: NextAuth.js
- **Styling**: Tailwind CSS
- **SDK**: Spotify Web Playback SDK
- **API**: Spotify Web API,
    
            Gemini API, 
    
      Openweathermap API, 
    
      Googletranslation API,
    
      네이버 검색 API
    

# About

---

## 초기 화면

- **스포티파이**로 로그인하도록 유도하는 화면이 뜹니다.

![Untitled](https://prod-files-secure.s3.us-west-2.amazonaws.com/f6cb388f-3934-47d6-9928-26d2e10eb0fc/dba576ac-fb73-449d-92f2-8c0e596d099b/Untitled.png)

## 로그인

- 로그인 버튼을 누르면 자동으로 **스포티파이 로그인**으로 연결되어서 로그인이 가능합니다.
- 로그인을 완료하면 **자신만의 일기**를 기록할 수 있는 탭이 연결됩니다.
- 스포티파이에서 받아온 유저 정보를 이용해 `Navigation Bar`에 유저의 이메일을 표시합니다.

![Untitled](https://prod-files-secure.s3.us-west-2.amazonaws.com/f6cb388f-3934-47d6-9928-26d2e10eb0fc/185b9c7c-2218-4a11-b737-7ebb101238b0/Untitled.png)

[localhost_3000 - Chrome 2024-07-17 17-44-54.mp4](https://prod-files-secure.s3.us-west-2.amazonaws.com/f6cb388f-3934-47d6-9928-26d2e10eb0fc/c532a9c4-9a71-4ec3-9999-45c665028559/localhost_3000_-_Chrome_2024-07-17_17-44-54.mp4)

## 장르 선택

- **장르 선택 탭**을 통해서, 장르 선택 탭에 들어가면 사용자가 듣고자 하는 **음악의 장르를 선택**할 수 있습니다.
- 여기서 선택된 장르는 `Database`에 저장되어있는 유저 정보를 업데이트하여, 음악 추천을 받을 때 이용합니다.
- 선택한 장르는 `Navigation Bar`에 항상 표시됩니다.

[장르선택.mp4](https://prod-files-secure.s3.us-west-2.amazonaws.com/f6cb388f-3934-47d6-9928-26d2e10eb0fc/7cc16a5c-0736-48da-8594-ef6b767f9fcd/%EC%9E%A5%EB%A5%B4%EC%84%A0%ED%83%9D.mp4)

![Untitled](https://prod-files-secure.s3.us-west-2.amazonaws.com/f6cb388f-3934-47d6-9928-26d2e10eb0fc/472c0f25-8d0e-4331-9c05-54bc59410c65/Untitled.png)

## 최신 뉴스

- 뉴스 보기 버튼을 누르면, **네이버 검색 API**를 이용해서 가장 최신 뉴스들을 자동으로 크롤링해서 IT/과학, 경제, 사회, 생활/문화, 세계, 정치 분야에 해당하는 뉴스를 띄워줍니다.
- 뉴스 제목을 클릭하여 해당 뉴스를 볼 수 있습니다.
- 뉴스 접기 버튼을 눌러 `Side Bar`를 숨길 수 있습니다.

[뉴스창.mp4](https://prod-files-secure.s3.us-west-2.amazonaws.com/f6cb388f-3934-47d6-9928-26d2e10eb0fc/21c89452-f45b-46fd-98ef-58b0bfc5352d/%EB%89%B4%EC%8A%A4%EC%B0%BD.mp4)

## 일기 작성

### API 통신

- API통신을 통해서 `Next.js`에서 `Flask` 서버로 장르와 일기 내용을 함께 보내면, **Gemini API**를 이용하여  추천하는 음악 3개의 스포티파이 url과 추천 이유를 응답으로 받습니다.
- 이 때 서버로 보내는 장르는 유저의 정보에 저장되어 있는 장르 리스트를 보냅니다.

![Untitled](https://prod-files-secure.s3.us-west-2.amazonaws.com/f6cb388f-3934-47d6-9928-26d2e10eb0fc/f0da6157-0964-4131-9678-f66183e7665b/Untitled.png)

![Untitled](https://prod-files-secure.s3.us-west-2.amazonaws.com/f6cb388f-3934-47d6-9928-26d2e10eb0fc/f33935df-57e6-497f-970f-e34af107ef53/Untitled.png)

### 일기 저장

- 일기가 저장될 때 제목, 내용, 날씨, 추천 받은 음악 리스트, 작성자, 작성 날짜가 함께 저장됩니다.
- 여기서 저장되는 날씨는 현재 날씨 정보를 불러옵니다.
- 일기가 저장이 되면 추천 받은 음악 리스트를 `Player`가 자동으로 재생합니다.

![Untitled](https://prod-files-secure.s3.us-west-2.amazonaws.com/f6cb388f-3934-47d6-9928-26d2e10eb0fc/3403120e-45cb-42da-ad42-09d861401da3/Untitled.png)

![Untitled](https://prod-files-secure.s3.us-west-2.amazonaws.com/f6cb388f-3934-47d6-9928-26d2e10eb0fc/b406ade2-e042-4799-b146-6c150306d5d1/Untitled.png)

### 음악 플레이어

- 음악을 추천 받거나, 저장된 일기에 있는 재생 버튼을 누르면, `Player`가 화면 왼쪽에 나타납니다.
- `Player`에는 재생, 정지, 이전, 다음 버튼이 있어 듣고자 하는 음악을 고를 수 있습니다.
- 현재 재생중인 노래가 끝나면, 자동으로 다음 노래가 재생됩니다.
- `Player` 하단에는 음악을 추천해준 이유가 표시됩니다.
- 토글 버튼이 있어, 노래에 해당하는 앨범 커버를 숨기거나 보이게 할 수 있습니다.

[localhost_3000 - Chrome 2024-07-17 19-02-17.mp4](https://prod-files-secure.s3.us-west-2.amazonaws.com/f6cb388f-3934-47d6-9928-26d2e10eb0fc/29d9aae6-f375-4498-805e-7cceae079401/localhost_3000_-_Chrome_2024-07-17_19-02-17.mp4)

## 일기 꺼내보기

- 저장된 일기는 해당 유저가 작성한 일기만이 표시됩니다.
- 저장된 일기는 일기 입력 창 아래에 최신 순으로 5개씩 정렬되어 나타납니다.
- 각 일기에는 일기의 제목과 내용, 작성 당시의 날씨와 시간과 함께 추천 받은 음악 리스트가 같이 저장되어 있습니다.
- 저장된 일기의 내용이 3줄을 넘어가면 “…”으로 생략 표시됩니다.
- 생략 표시된 일기를 클릭하면 전체 일기를 볼 수 있으며, 줄 노트 위에 작성한 내용이 보여집니다.
- 일기에 있는 재생 버튼 클릭 시 저장된 음악 리스트가 음악`Player`에서 재생됩니다.
- 일기에 있는 휴지통 버튼을 클릭 시 저장된 일기가 삭제됩니다.

[localhost_3000 - Chrome 2024-07-17 19-05-24.mp4](https://prod-files-secure.s3.us-west-2.amazonaws.com/f6cb388f-3934-47d6-9928-26d2e10eb0fc/7ed1cb34-4c1a-43c8-9a53-7722d0debaa0/localhost_3000_-_Chrome_2024-07-17_19-05-24.mp4)
