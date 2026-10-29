from pathlib import Path
import re
p=Path('/home/user/output/polar_home_snow_mission_demo.html')
s=p.read_text(encoding='utf-8')
m=re.search(r'\.detail-art\{[^}]*?url\("(data:image/webp;base64,[^"]+)"\)',s,re.S)
if not m: raise SystemExit('reference artwork not found')
art=m.group(1)
# Replace cropped background banner with explicit two-column layout: full artwork is contained, never cropped.
pattern=r'function detailShell\(title,sub,body\)\{.*?\}\nfunction openDetail'
replacement='''function detailShell(title,sub,body){return `<div class="detail-head"><button class="back-btn" onclick="showScreen('mypage')" aria-label="마이페이지로 돌아가기">←</button><div><h1 class="detail-title">${title}</h1><p class="detail-sub">${sub}</p></div></div><div class="detail-art"><div class="detail-art-copy"><strong>북극곰과 함께</strong><span>작은 실천으로 빙하를 지켜요</span></div><img src="'''+art+'''" alt="사용자가 제공한 북극곰과 빙하 그림"></div>${body}`}\nfunction openDetail'''
s,n=re.subn(pattern,replacement,s,count=1,flags=re.S)
if n!=1: raise SystemExit(f'detailShell replacement count {n}')
# Update quiz question card with visible bear/ice scene and a feedback slot after each response.
s=s.replace('<article class="card mission-start-card"><div class="mission-topline">', '<div class="quiz-scene-full"><img src="'+art+'" alt="빙하 위 북극곰"><div><strong>북극곰이 함께 풀어요!</strong><small>문제를 맞히면 힘차게 응원해요</small></div></div><article class="card mission-start-card"><div class="mission-topline">',1)
s=s.replace('<p class="detail-note">정답을 고르면 다음 문제로 이동해요.</p><button class="secondary detail-action" onclick="openDetail(\'missions\')">미션 지도</button>', '<div id="answerFeedback" class="answer-feedback" aria-live="polite"></div><p class="detail-note">답을 선택하면 북극곰의 표정과 응원을 확인할 수 있어요.</p><button class="secondary detail-action" onclick="openDetail(\'missions\')">미션 지도</button>',1)
# Replace automatic quick-advance with feedback state and explicit next-question action.
start=s.index('function chooseAnswer(choice)')
end=s.index('\nfunction finishStage()',start)
new_func='''function chooseAnswer(choice){const qs=questQuestions[missionState.stage-1];const q=qs[missionState.question];const originalChoice=missionState.answerOrder[choice];const correctDisplay=missionState.answerOrder.indexOf(q.c);const isCorrect=originalChoice===q.c;const buttons=[...detailContent.querySelectorAll('.quiz-choice')];buttons.forEach((b,i)=>{b.disabled=true;if(i===correctDisplay)b.classList.add('correct');else if(i===choice)b.classList.add('wrong')});if(isCorrect)missionState.correct++;const feedback=document.getElementById('answerFeedback');feedback.classList.add('show',isCorrect?'good':'try-again');feedback.innerHTML=`<div class="bear-reaction" aria-hidden="true">🐻‍❄️<span>${isCorrect?'😄':'😢'}</span></div><div class="reaction-copy"><strong>${isCorrect?'정답이에요! 북극곰이 신나게 응원해요!':'아쉬워요… 북극곰이 다음 문제도 응원해요!'}</strong><small>${isCorrect?'참 잘했어요!':'괜찮아요. 정답을 확인하고 다시 도전해요.'} ${isCorrect?'':'정답: '+q.a[q.c]}</small></div><button class="primary" onclick="continueQuiz()">${missionState.question<2?'다음 문제 보기 →':'결과 확인하기 →'}</button>`;}
function continueQuiz(){missionState.question++;if(missionState.question<3)renderQuestion();else finishStage()}'''
s=s[:start]+new_func+s[end:]
# Provide a full contained artwork panel on the mountain map itself, too.
needle='return `<div class="mission-topline"><div><strong style="color:#123c68">설산 오르기</strong>'
replacement='return `<div class="mission-picture"><img src="'+art+'" alt="빙하 설산에 오른 북극곰"><div><strong>북극곰과 설산을 올라요</strong><small>한 단계씩 퀴즈를 풀고 정상에 도전!</small></div></div><div class="mission-topline"><div><strong style="color:#123c68">설산 오르기</strong>'
if needle not in s: raise SystemExit('mission map insertion anchor missing')
s=s.replace(needle,replacement,1)
# Add final styles after existing CSS but before media query. Ensure picture is fully visible with object-fit:contain.
css='''
/* Final artwork and quiz reaction polish: uploaded images shown whole, not as cropped backgrounds */
.detail-art{height:auto;min-height:114px;margin:0 0 13px;padding:8px 12px;display:flex;align-items:center;justify-content:space-between;gap:8px;background:linear-gradient(120deg,#eefaff,#d7f1ff)!important;background-image:none!important;overflow:hidden}
.detail-art-copy{flex:1;min-width:0;display:flex;flex-direction:column;gap:4px}.detail-art-copy strong{font-size:15px;color:#123c68}.detail-art-copy span{font-size:11px;color:#58718a}.detail-art img{display:block;width:42%;height:100px;object-fit:contain;object-position:center;flex:none;border-radius:10px}
.mission-picture{display:flex;align-items:center;gap:11px;padding:9px 11px;margin-bottom:11px;border:1px solid #d1e9f7;border-radius:16px;background:linear-gradient(120deg,#f3fbff,#ddf3ff);min-height:91px}.mission-picture img{width:34%;height:78px;object-fit:contain;object-position:center;flex:none}.mission-picture div{display:flex;flex-direction:column;gap:4px}.mission-picture strong{font-size:13px;color:#123c68}.mission-picture small{font-size:11px;color:#58718a;line-height:1.4}
.quiz-scene-full{display:flex;align-items:center;gap:12px;padding:9px 12px;margin-bottom:10px;border:1px solid #d1e9f7;border-radius:16px;background:linear-gradient(120deg,#f2fbff,#d9f2ff);min-height:91px}.quiz-scene-full img{width:34%;height:73px;object-fit:contain;flex:none}.quiz-scene-full div{display:flex;flex-direction:column;gap:4px}.quiz-scene-full strong{font-size:14px;color:#123c68}.quiz-scene-full small{font-size:11px;color:#58718a}
.answer-feedback{display:none;margin:13px 0 6px;padding:12px;border-radius:15px;background:#f2f8ff;border:1px solid #d8e8f4}.answer-feedback.show{display:grid;grid-template-columns:48px 1fr;gap:4px 10px;align-items:center}.answer-feedback.good{background:#edfbf4;border-color:#ccefdc}.answer-feedback.try-again{background:#fff6f2;border-color:#f4ddcf}.bear-reaction{font-size:33px;position:relative;line-height:1}.bear-reaction span{position:absolute;font-size:18px;right:-3px;bottom:-1px}.reaction-copy{display:flex;flex-direction:column;gap:4px}.reaction-copy strong{font-size:12px;color:#17446f;line-height:1.35}.reaction-copy small{font-size:11px;color:#5b6e80;line-height:1.35}.answer-feedback .primary{grid-column:1/-1;margin-top:5px;min-height:43px}
@media(max-width:370px){.detail-art{min-height:103px;padding:7px}.detail-art img{height:86px;width:40%}.mission-picture img,.quiz-scene-full img{width:32%;height:66px}.mission-picture strong,.quiz-scene-full strong{font-size:12px}}
'''
s=s.replace('@media(min-width:600px)',css+'\n@media(min-width:600px)',1)
out=Path('/home/user/output/polar_home_final_bear_mission_demo.html')
out.write_text(s,encoding='utf-8')
print('created',out,'size',out.stat().st_size)
