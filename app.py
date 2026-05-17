import os
from flask import Flask, send_from_directory

# static_folder를 프론트엔드 빌드 결과물 폴더인 'templates/dist'로 지정합니다.
app = Flask(__name__, static_folder='Templates/dist')

@app.route('/')
def home():
    # 기본 경로 접속 시 dist/index.html 반환
    return send_from_directory(app.static_folder, 'index.html')

# 정적 파일(js, css, 이미지 등) 및 React Router를 위한 라우트 설정
@app.route('/<path:path>')
def serve_static(path):
    # 요청된 파일이 dist 폴더 내에 존재하는지 확인
    if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    
    # 그 외의 모든 경로는 index.html로 보내어 React Router가 처리하도록 함
    return send_from_directory(app.static_folder, 'index.html')

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
